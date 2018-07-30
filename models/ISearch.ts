export interface ISearchCategory {
    id: string;
    name: string;
    slug: string;
    count: number;
    subcategories?: ISearchCategory[];
}

export interface ISearchDepartment {
    id: string;
    name: string;
    slug: string;
    count: number;
    categories?: ISearchCategory[];
}

export interface ISearchCoupon {
    id: string;
    brandName: string;
    krogerCouponNumber: string;
    title: string;
    shortDescription: string;
    displayDescription: string;
    requirementDescription: string;
    longDescription?: string;
    savings: string;
    expirationDate: string;
    imageUrl: string;
    redemptionsAllowed: string;
    // subcategory?: 
    value: string;
    offerPriority: number;
    requirementQuantity: number;

    addedToCard: boolean;
    canBeAddedToCard: boolean;
    canBeRemoved: boolean;
    needToAddLoyaltyCard: boolean;

    featured: boolean;
    categories: string[];

    filterTags: string[];
    tagText?: string;
    tagBadgeText?: string;
    tagTooltipText?: string;
    expirationText?: string;
    // expirationCountdown?:
}

export interface ISearchCoupons {
    [couponId: string]: ISearchCoupon;
}

export interface ISearchBrand {
    name: string;
    count: number;
}

export interface ISearchNutrition {
    name: string;
    count: number;
}

export interface ISearchProductsInfo {
    totalCount: number;
    departments: ISearchDepartment[];
    coupons: ISearchCoupons;
    brands: ISearchBrand[];
    nutrition: ISearchNutrition[];
    // fulfillment:
    hasError: boolean;
    searchId: string;
}

export interface ISearchSponsoredItem {
    // favorite?:
    impression_id: string;
    monetization_payload: string;
    upc: string;
}

export interface ISearchArticle {
    slug: string;
    headline: string;
    body: string;
}

export default interface ISearch {
    productsInfo: ISearchProductsInfo;
    upcs: string[];
    sponsoredItems: ISearchSponsoredItem[];
    favorites: {[id: string]: boolean}
    // coupons:
    // couponsInfo: ISearchCouponsInfo;
    articles: ISearchArticle[];
    // articlesInfo: ISearchArticlesInfo;
}