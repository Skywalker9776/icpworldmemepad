import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface OwnershipRecord {
    owner: Principal;
    memecoin: string;
    amount: bigint;
    percentage: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface LiquidityLock {
    unlockDate: Time;
    duration: bigint;
    isLocked: boolean;
    amount: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface Transaction {
    id: string;
    status: TransactionStatus;
    transactionType: TransactionType;
    destinationAddress?: string;
    user: Principal;
    timestamp: Time;
    confirmationDetails?: string;
    memecoin?: string;
    amount: bigint;
}
export interface TradingTransaction {
    seller: Principal;
    timestamp: Time;
    buyer: Principal;
    memecoin: string;
    price: bigint;
    amount: bigint;
}
export interface Wallet {
    balance: bigint;
    owner: Principal;
    createdAt: Time;
    depositAddress: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Referral {
    referralCode: string;
    referrer: Principal;
    referredUsers: Array<Principal>;
    createdAt: Time;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface FeeRecord {
    user: Principal;
    depositAddress: string;
    timestamp: Time;
    amount: bigint;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    name: string;
    createdAt: Time;
    email: string;
}
export interface Memecoin {
    creator: Principal;
    logo: ExternalBlob;
    name: string;
    createdAt: Time;
    liquidityLock: LiquidityLock;
    description: string;
    totalSupply: bigint;
    category: string;
    symbol: string;
}
export enum TransactionStatus {
    pending = "pending",
    confirmed = "confirmed",
    failed = "failed"
}
export enum TransactionType {
    deposit = "deposit",
    withdrawal = "withdrawal"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveTrade(memecoin: string, buyer: Principal, amount: bigint, price: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createMemecoin(name: string, symbol: string, description: string, totalSupply: bigint, logo: ExternalBlob, lockDuration: bigint, category: string): Promise<void>;
    designateCEO(principal: Principal): Promise<void>;
    generateInviteCode(): Promise<string>;
    generateReferralLink(): Promise<string>;
    getActorId(): Promise<string>;
    getAllOwnershipRecords(): Promise<Array<OwnershipRecord>>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getAllReferrals(): Promise<Array<Referral>>;
    getAllTradingTransactions(): Promise<Array<TradingTransaction>>;
    getAvailableCategories(): Promise<Array<string>>;
    getCEO(): Promise<string>;
    getCEOPrincipal(): Promise<Principal | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCallerWallet(): Promise<Wallet | null>;
    getDepositAddress(): Promise<string>;
    getFeeRecords(): Promise<Array<FeeRecord>>;
    getHotMemecoins(): Promise<Array<Memecoin>>;
    getIcpswapWalletAddress(): Promise<string>;
    getIcpswapWalletBalance(): Promise<bigint>;
    getIcpswapWalletConnectionStatus(): Promise<boolean>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getLiquidityLocks(): Promise<Array<LiquidityLock>>;
    getMemecoins(): Promise<Array<Memecoin>>;
    getMemecoinsbyCategory(cat: string): Promise<Array<Memecoin>>;
    getNewMemecoins(): Promise<Array<Memecoin>>;
    getOfficialDepositAddresses(): Promise<Array<string>>;
    getOfficialTelegram(): Promise<string>;
    getOfficialTwitter(): Promise<string>;
    getOwnershipRecords(): Promise<Array<OwnershipRecord>>;
    getProgressingMemecoins(): Promise<Array<Memecoin>>;
    getReferralCode(): Promise<string>;
    getReferralStats(): Promise<Referral | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTradingFeeRate(): Promise<bigint>;
    getTradingTransactions(): Promise<Array<TradingTransaction>>;
    getTransactionHistory(): Promise<Array<Transaction>>;
    getTrendingMemecoins(): Promise<Array<Memecoin>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWalletConnectionOptions(): Promise<Array<[string, boolean]>>;
    initializeAccessControl(): Promise<void>;
    isCEO(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    revokeCEO(principal: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setTradingFeeRate(newRate: bigint): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    trackReferral(code: string): Promise<void>;
    tradeMemecoin(memecoin: string, amount: bigint, price: bigint, seller: Principal): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    withdrawICP(amount: bigint, destinationAddress: string): Promise<string>;
}
