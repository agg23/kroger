export interface IReceiptAddress {
    address1: string;
    address2: string;
}

export interface IReceiptId {
    userId: string;
    divisionNumber: string;
    storeNumber: string;
    transactionDate: string;
    terminalNumber: string;
    transactionId: string;
}

export interface IReceiptTax {
    type: string;
    amount: number;
}

export interface IReceiptTenders {
    tenderType: string;
    tenderAmount: number;
    reasonCode: number;
    referenceCode: string;
}

export interface IReceiptItemCategories {
    category: string;
    categoryCode: string;
}

export interface IReceiptItemDetail {
    upc: string;
    customerFacingSize: string;
    description?: string;
    familyTreeCommodityCode: string;
    familyTreeDepartmentCode: string;
    familyTreeSubCommodityCode: string;

    mainImage: string;

    soldInStore: boolean;

    categories: IReceiptItemCategories[];
}

export interface IReceiptItem {
    itemIdentifier: string;
    baseUpc: string;
    department: string;
    unitOfMeasure: string;

    detail: IReceiptItemDetail;

    quantity: number;
    totalSavings: number;
    extendedPrice: number;
    pricePaid: number;
    // priceModifiers
    unitPrice: number;
    itemType: string;
    entryMethod: string;

    imageUrl: string;
    detailUrl: string;

    sellableUpc: string;

    pharmacy: boolean;
    fuel: boolean;
    weighted: boolean;
    giftCard: boolean;
    containerDeposit: boolean;
}

export default interface IReceipt {
    address: IReceiptAddress;
    items?: IReceiptItem[];
    totalSavings?: number;
    totalLineItems: number;
    loyaltyId: string;
    receiptId: IReceiptId;

    tax?: IReceiptTax[];
    tenders?: IReceiptTenders[];
    
    total: number;
    subtotal: number;
    totalTender?: number;
    totalTax?: number;
    fulfillmentType: string;
    // priceModifiers
    // tags
    source: string;
    version: string;
    transactionTime: string;
}