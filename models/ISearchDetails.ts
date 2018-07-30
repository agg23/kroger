import { ISearchCoupons } from "./ISearch";

export interface ISearchCategory {
    name: string;
    code: string;
    categoryCode: string;
    categoryName: string;
    category: string;
}

export interface ISearchImage {
    url: string;
    perspective: string;
    size: string;
}

export interface ISearchDetailsProduct {
    brandName?: string;
    clickListItem: boolean;
    countryOfOrigin?: string;
    customerFacingSize: string;
    description: string;
    // forceSize?:
    homeDeliveryItem: boolean;
    images: ISearchImage[];
    mainImagePerspective: string;

    multipackItem: boolean;
    multipackQuantity: string;
    // options:
    // romanceDescription?:
    seoDescription: string;
    // serviceCounter?:
    shipToHomeItem: boolean;
    soldInStore: boolean;

    temperatureIndicator: string;
    verified: boolean;
    mainImage: string;
    slug: string;
    categories: ISearchCategory[];

    // calculatedPromoPrice?:
    calculatedRegularPrice: string;
    // calculatedReferencePrice?:

    displayTemplate: string;
    division: string;
    // minimumAdvertisedPrice?:
    orderBy: string;
    regularNFor: string;
    referenceNFor: string;
    // promoNfor?:
    // referencePrice?:

    store: string;
    // endDate?:
    priceNormal: string;
    // priceSale?: 
    promoDescription: string;
    // promoType?:
    soldBy: string;

    upc: string;
    // couponId?:
    // offers:
    // couponIds:
    hasPrice: boolean;
    loyalMember: boolean;
    // primaryIndex?:
    curbsidePickupEligible: boolean;
}

export default interface ISearchDetails {
    products: ISearchDetailsProduct[];
    coupons: ISearchCoupons;
    // departments: 
    priceHasError: boolean;
    totalCount: number;
}