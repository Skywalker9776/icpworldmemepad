import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Blob "mo:core/Blob";
import Random "mo:core/Random";

import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Storage "mo:caffeineai-object-storage/Storage";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import InviteLinksModule "mo:caffeineai-invite-links/invite-links-module";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Stripe "mo:caffeineai-stripe/stripe";


actor {
    // ── Blob storage ─────────────────────────────────────────────────────────────
    include MixinObjectStorage();

    // ── Access control ────────────────────────────────────────────────────────────
    let accessControlState = AccessControl.initState();
    var isAccessControlInitialized : Bool = false;
    include MixinAuthorization(accessControlState);

    // ── CEO / fee routing ─────────────────────────────────────────────────────────
    let officialDepositAddress1 : Text = "06c47d7b5d8e0abe4847ccb5bb15b393d16e57d814a4f976349f4e27552e8c03";
    let officialDepositAddress2 : Text = "4f4bb79bb0aa7807cd7781424f65ebe2ec756f2e4670056ccccd042c02000000";
    var tradingFeeRate : Nat = 100_000_000;
    var ceoPrincipal : ?Principal = null;
    var designatedCEOs = Map.empty<Principal, Bool>();

    // ── Stripe config (kept for migration state compatibility) ────────────────────
    var stripeConfiguration : ?Stripe.StripeConfiguration = null;

    // ── User types ────────────────────────────────────────────────────────────────
    public type UserProfile = {
        name : Text;
        email : Text;
        createdAt : Time.Time;
    };

    public type Wallet = {
        owner : Principal;
        balance : Nat;
        createdAt : Time.Time;
        depositAddress : Text;
    };

    public type TransactionStatus = { #pending; #confirmed; #failed };
    public type TransactionType = { #deposit; #withdrawal };

    public type Transaction = {
        id : Text;
        user : Principal;
        amount : Nat;
        status : TransactionStatus;
        transactionType : TransactionType;
        timestamp : Time.Time;
        memecoin : ?Text;
        destinationAddress : ?Text;
        confirmationDetails : ?Text;
    };

    // ── Memecoin types ────────────────────────────────────────────────────────────
    public type LiquidityLock = {
        amount : Nat;
        duration : Nat;
        unlockDate : Time.Time;
        isLocked : Bool;
    };

    public type Memecoin = {
        name : Text;
        symbol : Text;
        description : Text;
        totalSupply : Nat;
        creator : Principal;
        createdAt : Time.Time;
        logo : Storage.ExternalBlob;
        liquidityLock : LiquidityLock;
        category : Text;
    };

    public type TradingTransaction = {
        memecoin : Text;
        buyer : Principal;
        seller : Principal;
        amount : Nat;
        price : Nat;
        timestamp : Time.Time;
    };

    public type FeeRecord = {
        user : Principal;
        amount : Nat;
        timestamp : Time.Time;
        depositAddress : Text;
    };

    public type Referral = {
        referrer : Principal;
        referralCode : Text;
        referredUsers : [Principal];
        createdAt : Time.Time;
    };

    public type OwnershipRecord = {
        owner : Principal;
        memecoin : Text;
        amount : Nat;
        percentage : Nat;
    };

    public type TradeApproval = {
        seller : Principal;
        buyer : Principal;
        memecoin : Text;
        amount : Nat;
        price : Nat;
        expiresAt : Time.Time;
    };

    // ── State maps ────────────────────────────────────────────────────────────────
    var userProfiles = Map.empty<Principal, UserProfile>();
    var wallets = Map.empty<Principal, Wallet>();
    var transactions = Map.empty<Principal, [Transaction]>();
    var referralTrackingAttempts = Map.empty<Principal, Time.Time>();
    var memecoinCreationAttempts = Map.empty<Principal, Time.Time>();
    var tradeAttempts = Map.empty<Principal, Time.Time>();

    var memecoins = Map.empty<Text, Memecoin>();
    var tradingTransactions = Map.empty<Text, [TradingTransaction]>();
    var feeRecords = Map.empty<Text, [FeeRecord]>();
    var referrals = Map.empty<Text, Referral>();
    var ownershipRecords = Map.empty<Text, OwnershipRecord>();
    var memecoinNames = Map.empty<Text, Text>();
    var tradeApprovals = Map.empty<Text, TradeApproval>();
    var usedReferralCodes = Map.empty<Principal, Text>();

    // ── Cached deposit addresses (stable, computed once per user) ─────────────────
    var depositAddresses = Map.empty<Principal, Text>();

    // ── Invite links ──────────────────────────────────────────────────────────────
    let inviteState = InviteLinksModule.initState();

     // ══════════════════════════════════════════════════════════════════════════════
     // Canonical ICP Ledger AccountIdentifier
     // Uses Principal.toLedgerAccount which implements SHA-224 + CRC32 correctly.
     // Each user gets a unique address via a subaccount derived from their principal.
     // ══════════════════════════════════════════════════════════════════════════════

     func computeDepositAddress(user : Principal) : Text {
         // Create a 32-byte subaccount from the user's principal bytes (zero-padded)
         // This gives each user a unique, stable deposit address
         let principalBytes = user.toBlob().toArray();
         let subaccountBytes = Array.tabulate<Nat8>(32, func(i) {
             if (i < principalBytes.size()) principalBytes[i] else 0
         });
         let subaccountBlob = Blob.fromArray(subaccountBytes);

         // toLedgerAccount = SHA-224(domain_sep ++ principal_bytes ++ subaccount) + CRC32 prefix
         let accountBlob = user.toLedgerAccount(?subaccountBlob);
         let accountBytes = accountBlob.toArray();

         // Encode as 64 lowercase hex chars
         let hex = "0123456789abcdef";
         let hexArr = hex.toArray();
         var addr = "";
         for (byte in accountBytes.vals()) {
             addr #= Text.fromChar(hexArr[byte.toNat() / 16]);
             addr #= Text.fromChar(hexArr[byte.toNat() % 16]);
         };
         addr;
     };

     // Get or compute and cache a user's deposit address
     func getOrCreateDepositAddress(user : Principal) : Text {
         switch (depositAddresses.get(user)) {
             case (?addr) addr;
             case null {
                 let addr = computeDepositAddress(user);
                 depositAddresses.add(user, addr);
                 addr;
             };
         };
     };

     // ══════════════════════════════════════════════════════════════════════════════
     // Internal helpers
     // ══════════════════════════════════════════════════════════════════════════════

    func requireACInit() {
        if (not isAccessControlInitialized) {
            Runtime.trap("Access control must be initialized first");
        };
    };

    func requireNonAnon(p : Principal) {
        if (p.isAnonymous()) Runtime.trap("Anonymous principals not allowed");
    };

    func isCEOCheck(p : Principal) : Bool {
        if (p.isAnonymous()) return false;
        switch (ceoPrincipal) {
            case (?ceo) { if (Principal.equal(p, ceo)) return true };
            case null {};
        };
        switch (designatedCEOs.get(p)) {
            case (?true) true;
            case _ false;
        };
    };

    func isValidEmail(email : Text) : Bool {
        let chars = email.toArray();
        var hasAt = false;
        var hasDot = false;
        var atPos = 0;
        var i = 0;
        if (chars.size() < 5 or chars.size() > 254) return false;
        for (c in chars.vals()) {
            if (c == '@') { if (hasAt) return false; hasAt := true; atPos := i };
            if (c == '.' and hasAt and i > atPos) hasDot := true;
            i += 1;
        };
        hasAt and hasDot and (atPos + 1) < chars.size();
    };

    func hasProfile(user : Principal) : Bool {
        if (user.isAnonymous()) return false;
        switch (userProfiles.get(user)) {
            case null false;
            case (?p) p.name != "" and p.email != "" and isValidEmail(p.email);
        };
    };

    func ownerAmt(owner : Principal, coin : Text) : Nat {
        switch (ownershipRecords.get(owner.toText() # "-" # coin)) {
            case null 0;
            case (?rec) rec.amount;
        };
    };

    func coinSupply(coin : Text) : Nat {
        switch (memecoins.get(coin)) { case null 0; case (?m) m.totalSupply };
    };

    func cat<T>(a : [T], b : [T]) : [T] { a.concat(b) };

    func mkReferralCode(user : Principal) : Text {
        let bytes = user.toBlob().toArray();
        let hex = "0123456789abcdef";
        let hexArr = hex.toArray();
        var code = "ref-";
        let lim = if (bytes.size() < 8) bytes.size() else 8;
        var i = 0;
        while (i < lim) {
            code #= Text.fromChar(hexArr[bytes[i].toNat() / 16]);
            code #= Text.fromChar(hexArr[bytes[i].toNat() % 16]);
            i += 1;
        };
        code;
    };

    func isValidCategory(cat : Text) : Bool {
        let valid = [
            "Love & Romance", "Cosmic Dreams", "Animal Kingdom", "Cyber Punk",
            "Nature Spirit", "Warrior Soul", "Comedy Gold", "Nostalgia Wave",
            "Degen Finance", "Future Tech"
        ];
        valid.find(func(c : Text) : Bool { Text.equal(c, cat) }) != null;
    };

    // ══════════════════════════════════════════════════════════════════════════════
    // Access Control
    // ══════════════════════════════════════════════════════════════════════════════

    public shared ({ caller }) func initializeAccessControl() : async () {
        if (isAccessControlInitialized) return;
        requireNonAnon(caller);
        AccessControl.initialize(accessControlState, caller);
        isAccessControlInitialized := true;
        if (ceoPrincipal == null) {
            ceoPrincipal := ?caller;
            designatedCEOs.add(caller, true);
        };
    };

    public shared ({ caller }) func designateCEO(principal : Principal) : async () {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
            Runtime.trap("Unauthorized: Only admins can designate CEOs");
        };
        requireNonAnon(principal);
        if (ceoPrincipal == null) ceoPrincipal := ?principal;
        designatedCEOs.add(principal, true);
    };

    public shared ({ caller }) func revokeCEO(principal : Principal) : async () {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
            Runtime.trap("Unauthorized: Only admins can revoke CEO privileges");
        };
        requireNonAnon(principal);
        switch (ceoPrincipal) {
            case (?ceo) {
                if (Principal.equal(principal, ceo)) {
                    Runtime.trap("Cannot revoke original CEO privileges");
                };
            };
            case null {};
        };
        designatedCEOs.remove(principal);
    };

    public query ({ caller }) func isCEO() : async Bool { isCEOCheck(caller) };
    public query func getCEOPrincipal() : async ?Principal { ceoPrincipal };

    // ══════════════════════════════════════════════════════════════════════════════
    // User Profiles
    // ══════════════════════════════════════════════════════════════════════════════

    public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
        requireACInit();
        requireNonAnon(caller);
        userProfiles.get(caller);
    };

    public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
        requireACInit();
        requireNonAnon(caller);
        requireNonAnon(user);
        if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: Can only view your own profile");
        };
        userProfiles.get(user);
    };

    public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
            Runtime.trap("Unauthorized");
        };
        if (profile.name == "" or profile.email == "") Runtime.trap("Name and email required");
        if (not isValidEmail(profile.email)) Runtime.trap("Invalid email format");
        if (profile.name.size() < 2 or profile.name.size() > 100) {
            Runtime.trap("Profile name must be 2-100 characters");
        };
        userProfiles.add(caller, profile);
        // Compute and cache deposit address on first profile save
        let addr = getOrCreateDepositAddress(caller);
        switch (wallets.get(caller)) {
            case null {
                wallets.add(caller, {
                    owner = caller; balance = 0; createdAt = Time.now();
                    depositAddress = addr;
                });
            };
            case (?w) {
                // Update wallet's depositAddress if it was previously empty or placeholder
                if (w.depositAddress == "" or w.depositAddress == "loading") {
                    wallets.add(caller, { w with depositAddress = addr });
                };
            };
        };
        let code = mkReferralCode(caller);
        switch (referrals.get(code)) {
            case null {
                referrals.add(code, {
                    referrer = caller; referralCode = code;
                    referredUsers = []; createdAt = Time.now();
                });
            };
            case (?_) {};
        };
    };

    // ══════════════════════════════════════════════════════════════════════════════
    // Wallets & Deposits
    // ══════════════════════════════════════════════════════════════════════════════

    public query ({ caller }) func getCallerWallet() : async ?Wallet {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        wallets.get(caller);
    };

    // Returns the canonical ICP Ledger deposit address for the caller.
    // Address is computed once using SHA-224+CRC32 and cached permanently.
    public shared ({ caller }) func getDepositAddress() : async Text {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        getOrCreateDepositAddress(caller);
    };

    public query ({ caller }) func getTransactionHistory() : async [Transaction] {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        switch (transactions.get(caller)) { case null []; case (?t) t };
    };

    public shared ({ caller }) func withdrawICP(amount : Nat, destinationAddress : Text) : async Text {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        if (amount == 0) Runtime.trap("Amount must be > 0");
        if (destinationAddress == "") Runtime.trap("Destination address required");
        switch (wallets.get(caller)) {
            case null Runtime.trap("Wallet not found");
            case (?w) {
                if (w.balance < amount) Runtime.trap("Insufficient balance");
                wallets.add(caller, { w with balance = Nat.sub(w.balance, amount) });
                let txId = debug_show(Time.now());
                let tx : Transaction = {
                    id = txId; user = caller; amount; status = #pending;
                    transactionType = #withdrawal; timestamp = Time.now();
                    memecoin = null; destinationAddress = ?destinationAddress;
                    confirmationDetails = null;
                };
                let prev = switch (transactions.get(caller)) { case null []; case (?t) t };
                transactions.add(caller, cat(prev, [tx]));
                txId;
            };
        };
    };

    // ══════════════════════════════════════════════════════════════════════════════
    // Memecoins
    // ══════════════════════════════════════════════════════════════════════════════

    public shared ({ caller }) func createMemecoin(
        name : Text,
        symbol : Text,
        description : Text,
        totalSupply : Nat,
        logo : Storage.ExternalBlob,
        lockDuration : Nat,
        category : Text,
    ) : async () {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        if (not hasProfile(caller)) Runtime.trap("Complete your profile first");
        let ceoUser = isCEOCheck(caller);
        if (not ceoUser) {
            switch (memecoinCreationAttempts.get(caller)) {
                case (?last) {
                    if (Time.now() - last < 60_000_000_000) Runtime.trap("Rate limit exceeded");
                };
                case null {};
            };
        };
        memecoinCreationAttempts.add(caller, Time.now());
        if (name == "" or symbol == "" or description == "") Runtime.trap("Fields required");
        if (name.size() > 100 or symbol.size() > 20 or description.size() > 1000) Runtime.trap("Input too long");
        if (totalSupply < 100 or totalSupply > 1_000_000_000_000_000) Runtime.trap("Invalid total supply");
        if (lockDuration < 1 or lockDuration > 120) Runtime.trap("Lock duration 1-120 months");
        // Fair Mode: prevent duplicate names (case-insensitive)
        let nameLow = name.toLower();
        switch (memecoinNames.get(nameLow)) {
            case (?_) Runtime.trap("A memecoin with this name already exists (Fair Mode)");
            case null {};
        };
        switch (memecoins.get(symbol)) {
            case (?_) Runtime.trap("Memecoin symbol already exists");
            case null {};
        };
        // Validate category
        let resolvedCategory = if (isValidCategory(category)) category else "Future Tech";
        // CEO gets free creation; others pay 2 ICP (200_000_000 e8s)
        if (not ceoUser) {
            switch (wallets.get(caller)) {
                case null Runtime.trap("Wallet not found. Save your profile first.");
                case (?w) {
                    if (w.balance < 200_000_000) Runtime.trap("Insufficient balance: 2 ICP required");
                    wallets.add(caller, { w with balance = Nat.sub(w.balance, 200_000_000) });
                };
            };
        };
        let liquidityLock : LiquidityLock = {
            amount = Nat.div(totalSupply * 20, 100);
            duration = lockDuration;
            unlockDate = Time.now() + (lockDuration * 30 * 24 * 60 * 60 * 1_000_000_000);
            isLocked = true;
        };
        memecoins.add(symbol, {
            name; symbol; description; totalSupply;
            creator = caller; createdAt = Time.now(); logo; liquidityLock;
            category = resolvedCategory;
        });
        memecoinNames.add(nameLow, symbol);
        if (not ceoUser) {
            // Route 1 ICP (100_000_000 e8s) to each CEO wallet = 2 ICP total
            let prev = switch (feeRecords.get(symbol)) { case null []; case (?f) f };
            feeRecords.add(symbol, cat(cat(prev, [{
                user = caller; amount = 100_000_000;
                timestamp = Time.now(); depositAddress = officialDepositAddress1;
            }]), [{
                user = caller; amount = 100_000_000;
                timestamp = Time.now(); depositAddress = officialDepositAddress2;
            }]));
        };
        ownershipRecords.add(caller.toText() # "-" # symbol, {
            owner = caller; memecoin = symbol;
            amount = Nat.div(totalSupply * 30, 100); percentage = 30;
        });
    };

    public query func getMemecoins() : async [Memecoin] {
        memecoins.values().toArray();
    };

    public query func getHotMemecoins() : async [Memecoin] {
        memecoins.values().take(10).toArray();
    };

    public query func getTrendingMemecoins() : async [Memecoin] {
        memecoins.values().take(10).toArray();
    };

    public query func getNewMemecoins() : async [Memecoin] {
        memecoins.values().take(10).toArray();
    };

    public query func getProgressingMemecoins() : async [Memecoin] {
        memecoins.values().take(10).toArray();
    };

    public query func getMemecoinsbyCategory(cat : Text) : async [Memecoin] {
        let all = memecoins.values().toArray();
        all.filter(func(m : Memecoin) : Bool { Text.equal(m.category, cat) });
    };

    public query func getAvailableCategories() : async [Text] {
        [
            "Love & Romance", "Cosmic Dreams", "Animal Kingdom", "Cyber Punk",
            "Nature Spirit", "Warrior Soul", "Comedy Gold", "Nostalgia Wave",
            "Degen Finance", "Future Tech"
        ];
    };

    // ══════════════════════════════════════════════════════════════════════════════
    // Trading
    // ══════════════════════════════════════════════════════════════════════════════

    public shared ({ caller }) func approveTrade(memecoin : Text, buyer : Principal, amount : Nat, price : Nat) : async () {
        requireACInit();
        requireNonAnon(caller);
        requireNonAnon(buyer);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        if (not hasProfile(caller)) Runtime.trap("Complete your profile first");
        if (Principal.equal(caller, buyer)) Runtime.trap("Cannot approve trade with yourself");
        if (amount == 0 or price == 0) Runtime.trap("Amount and price must be > 0");
        if (ownerAmt(caller, memecoin) < amount) Runtime.trap("Insufficient balance");
        tradeApprovals.add(caller.toText() # "-" # buyer.toText() # "-" # memecoin, {
            seller = caller; buyer; memecoin; amount; price;
            expiresAt = Time.now() + 3_600_000_000_000;
        });
    };

    public shared ({ caller }) func tradeMemecoin(memecoin : Text, amount : Nat, price : Nat, seller : Principal) : async () {
        requireACInit();
        requireNonAnon(caller);
        requireNonAnon(seller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        if (not hasProfile(caller)) Runtime.trap("Complete your profile first");
        if (Principal.equal(caller, seller)) Runtime.trap("Cannot trade with yourself");
        if (amount == 0 or price == 0) Runtime.trap("Amount and price > 0 required");
        let ceoUser = isCEOCheck(caller);
        if (not ceoUser) {
            switch (tradeAttempts.get(caller)) {
                case (?last) {
                    if (Time.now() - last < 10_000_000_000) Runtime.trap("Rate limit: wait before trading");
                };
                case null {};
            };
        };
        tradeAttempts.add(caller, Time.now());
        let approvalKey = seller.toText() # "-" # caller.toText() # "-" # memecoin;
        switch (tradeApprovals.get(approvalKey)) {
            case null Runtime.trap("No trade approval found");
            case (?app) {
                if (app.expiresAt < Time.now()) Runtime.trap("Trade approval expired");
                if (app.amount < amount or app.price != price) Runtime.trap("Parameters mismatch");
            };
        };
        let sellerAmt = ownerAmt(seller, memecoin);
        if (sellerAmt < amount) Runtime.trap("Seller insufficient balance");
        let supply = coinSupply(memecoin);
        if (supply == 0) Runtime.trap("Invalid memecoin");
        let fee = if (ceoUser) 0 else Nat.div(price * amount, 500);
        switch (wallets.get(caller)) {
            case null Runtime.trap("Buyer wallet not found");
            case (?w) {
                let total = price * amount + fee;
                if (w.balance < total) Runtime.trap("Insufficient ICP balance");
                wallets.add(caller, { w with balance = Nat.sub(w.balance, total) });
            };
        };
        switch (wallets.get(seller)) {
            case null Runtime.trap("Seller wallet not found");
            case (?w) { wallets.add(seller, { w with balance = w.balance + price * amount }) };
        };
        let buyerNew = ownerAmt(caller, memecoin) + amount;
        let buyerPct = Nat.div(buyerNew * 100, supply);
        let sellerNew = Nat.sub(sellerAmt, amount);
        let sellerPct = Nat.div(sellerNew * 100, supply);
        if (not ceoUser and buyerPct > 30) Runtime.trap("Buyer would exceed 30% limit");
        ownershipRecords.add(caller.toText() # "-" # memecoin, {
            owner = caller; memecoin; amount = buyerNew; percentage = buyerPct;
        });
        ownershipRecords.add(seller.toText() # "-" # memecoin, {
            owner = seller; memecoin; amount = sellerNew; percentage = sellerPct;
        });
        let prevTxs = switch (tradingTransactions.get(memecoin)) { case null []; case (?t) t };
        tradingTransactions.add(memecoin, cat(prevTxs, [{
            memecoin; buyer = caller; seller; amount; price; timestamp = Time.now();
        }]));
        if (not ceoUser) {
            let feeAmt = Nat.div(price * amount, 1000);
            let prevFees = switch (feeRecords.get(memecoin)) { case null []; case (?f) f };
            feeRecords.add(memecoin, cat(cat(prevFees, [{
                user = caller; amount = feeAmt;
                timestamp = Time.now(); depositAddress = officialDepositAddress1;
            }]), [{
                user = caller; amount = feeAmt;
                timestamp = Time.now(); depositAddress = officialDepositAddress2;
            }]));
        };
        tradeApprovals.remove(approvalKey);
    };

    public query ({ caller }) func getTradingTransactions() : async [TradingTransaction] {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        var result : [TradingTransaction] = [];
        for ((_, txs) in tradingTransactions.entries()) {
            for (tx in txs.vals()) {
                if (Principal.equal(tx.buyer, caller) or Principal.equal(tx.seller, caller)) {
                    result := cat(result, [tx]);
                };
            };
        };
        result;
    };

    public query ({ caller }) func getAllTradingTransactions() : async [TradingTransaction] {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) Runtime.trap("Unauthorized: Only admins");
        var result : [TradingTransaction] = [];
        for ((_, txs) in tradingTransactions.entries()) { result := cat(result, txs) };
        result;
    };

    public query ({ caller }) func getFeeRecords() : async [FeeRecord] {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) Runtime.trap("Unauthorized: Only admins");
        var result : [FeeRecord] = [];
        for ((_, fees) in feeRecords.entries()) { result := cat(result, fees) };
        result;
    };

    public shared ({ caller }) func setTradingFeeRate(newRate : Nat) : async () {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) Runtime.trap("Unauthorized");
        if (newRate > 1_000_000_000) Runtime.trap("Fee rate cannot exceed 1 ICP");
        tradingFeeRate := newRate;
    };

    public query func getTradingFeeRate() : async Nat { tradingFeeRate };

    // ══════════════════════════════════════════════════════════════════════════════
    // Ownership & Liquidity
    // ══════════════════════════════════════════════════════════════════════════════

    public query ({ caller }) func getOwnershipRecords() : async [OwnershipRecord] {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        var result : [OwnershipRecord] = [];
        for ((_, rec) in ownershipRecords.entries()) {
            if (Principal.equal(rec.owner, caller)) result := cat(result, [rec]);
        };
        result;
    };

    public query ({ caller }) func getAllOwnershipRecords() : async [OwnershipRecord] {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) Runtime.trap("Unauthorized: Only admins");
        ownershipRecords.values().toArray();
    };

    public query ({ caller }) func getLiquidityLocks() : async [LiquidityLock] {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        let all = memecoins.values().toArray();
        all.map<Memecoin, LiquidityLock>(func(m : Memecoin) : LiquidityLock { m.liquidityLock });
    };

    // ══════════════════════════════════════════════════════════════════════════════
    // Referrals
    // ══════════════════════════════════════════════════════════════════════════════

    public shared ({ caller }) func generateReferralLink() : async Text {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        let code = mkReferralCode(caller);
        switch (referrals.get(code)) {
            case null {
                referrals.add(code, {
                    referrer = caller; referralCode = code;
                    referredUsers = []; createdAt = Time.now();
                });
            };
            case (?_) {};
        };
        code;
    };

    public query ({ caller }) func getReferralCode() : async Text {
        requireACInit();
        requireNonAnon(caller);
        mkReferralCode(caller);
    };

    public shared ({ caller }) func trackReferral(code : Text) : async () {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        if (code == "" or not code.startsWith(#text "ref-")) Runtime.trap("Invalid referral code format");
        let ceoUser = isCEOCheck(caller);
        if (not ceoUser) {
            switch (referralTrackingAttempts.get(caller)) {
                case (?last) {
                    if (Time.now() - last < 60_000_000_000) Runtime.trap("Rate limit exceeded");
                };
                case null {};
            };
        };
        referralTrackingAttempts.add(caller, Time.now());
        switch (usedReferralCodes.get(caller)) { case (?_) return; case null {} };
        switch (referrals.get(code)) {
            case null Runtime.trap("Invalid referral code");
            case (?ref) {
                if (Principal.equal(ref.referrer, caller)) Runtime.trap("Cannot use your own code");
                let already = ref.referredUsers.find(func(p : Principal) : Bool { Principal.equal(p, caller) });
                switch (already) {
                    case (?_) return;
                    case null {
                        referrals.add(code, { ref with referredUsers = cat(ref.referredUsers, [caller]) });
                        usedReferralCodes.add(caller, code);
                    };
                };
            };
        };
    };

    public query ({ caller }) func getReferralStats() : async ?Referral {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        referrals.get(mkReferralCode(caller));
    };

    public query ({ caller }) func getAllReferrals() : async [Referral] {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) Runtime.trap("Unauthorized: Only admins");
        referrals.values().toArray();
    };

    // ══════════════════════════════════════════════════════════════════════════════
    // Platform Info
    // ══════════════════════════════════════════════════════════════════════════════

    public query func getCEO() : async Text { "CEO: Akmal Bhutta" };
    public query func getOfficialTwitter() : async Text { "@icpmemeworld" };
    public query func getOfficialTelegram() : async Text { "https://t.me/icpworldmemepad" };
    public query func getOfficialDepositAddresses() : async [Text] {
        [officialDepositAddress1, officialDepositAddress2];
    };
    public query func getWalletConnectionOptions() : async [(Text, Bool)] {
        [("Internet Identity", true), ("Icpswap wallet", true), ("Gmail login", false)];
    };
    public query func getActorId() : async Text {
        "Use the Caffeine/dfx frontend agent to retrieve the canister ID.";
    };

    // ══════════════════════════════════════════════════════════════════════════════
    // Stripe config stub (state kept for upgrade compatibility)
    // ══════════════════════════════════════════════════════════════════════════════

    public query func isStripeConfigured() : async Bool { stripeConfiguration != null };

    public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) Runtime.trap("Unauthorized");
        stripeConfiguration := ?config;
    };

    public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        switch (stripeConfiguration) {
            case null Runtime.trap("Stripe not configured");
            case (?config) {
                await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
            };
        };
    };

    public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        switch (stripeConfiguration) {
            case null Runtime.trap("Stripe not configured");
            case (?config) {
                await Stripe.getSessionStatus(config, sessionId, transform);
            };
        };
    };

    // ══════════════════════════════════════════════════════════════════════════════
    // Invite Links
    // ══════════════════════════════════════════════════════════════════════════════

    public shared ({ caller }) func generateInviteCode() : async Text {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) Runtime.trap("Unauthorized: Only admins");
        let blob = await Random.blob();
        let code = InviteLinksModule.generateUUID(blob);
        InviteLinksModule.generateInviteCode(inviteState, code);
        code;
    };

    public shared ({ caller }) func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
        if (name == "" or inviteCode == "") Runtime.trap("Name and invite code required");
        if (name.size() < 2 or name.size() > 100) Runtime.trap("Name 2-100 chars");
        InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
    };

    public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) Runtime.trap("Unauthorized: Only admins");
        InviteLinksModule.getAllRSVPs(inviteState);
    };

    public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
        requireACInit();
        requireNonAnon(caller);
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) Runtime.trap("Unauthorized: Only admins");
        InviteLinksModule.getInviteCodes(inviteState);
    };

    // ══════════════════════════════════════════════════════════════════════════════
    // HTTP Transform
    // ══════════════════════════════════════════════════════════════════════════════

    public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
        OutCall.transform(input);
    };

    // ══════════════════════════════════════════════════════════════════════════════
    // Icpswap stubs
    // ══════════════════════════════════════════════════════════════════════════════

    public query ({ caller }) func getIcpswapWalletAddress() : async Text {
        requireACInit();
        requireNonAnon(caller);
        "Connect your Icpswap wallet via the frontend.";
    };

    public query ({ caller }) func getIcpswapWalletConnectionStatus() : async Bool {
        requireACInit();
        requireNonAnon(caller);
        true;
    };

    public query ({ caller }) func getIcpswapWalletBalance() : async Nat {
        requireACInit();
        requireNonAnon(caller);
        0;
    };
};
