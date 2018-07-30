'use strict';

import { Browser, launch, Page } from 'puppeteer';
import randomUserAgent from './useragents';
import * as querystring from 'querystring';
import IReceipt, { IReceiptItem } from './models/IReceipt';
import { start } from 'repl';
import ISearch from './models/ISearch';
import ISearchDetails, { ISearchDetailsProduct } from './models/ISearchDetails';

export default class Kroger {
    endpoint: string = "https://www.kroger.com/";

    browser: Browser;
    page: Page;

    constructor(endpoint?: string) {
        this.endpoint = endpoint;
    }

    async setUp() {
        this.browser = await launch({ headless: false, args: ["--disable-web-security"]});
        this.page = await this.browser.newPage();

        await this.detectionBypass();
    }

    async detectionBypass() {
        var userAgent = randomUserAgent();
        this.page.setUserAgent(userAgent);

        console.log("Using user agent: " + userAgent);

        var width = 1024 + Math.floor(Math.random() * 100);
        var height = 768 + Math.floor(Math.random() * 100);

        await this.page.setViewport({
            width: width,
            height: height
        });

        console.log(`Using viewport ${width}x${height}`);

        await this.page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            })
        });

        await this.page.setRequestInterception(true);

        // Disabling "bd-1-30" breaks login
        var disallowedUrlTest = RegExp(`adobe|mbox|ruxitagentjs|akam|sstats.kroger.com|
                rb_[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}`);

        this.page.on('request', (request) => {
            const url = request.url();
            // Check request if it is for the file
            // that we want to block, and if it is, abort it
            // otherwise just let it run
            if (disallowedUrlTest.test(url)) {
                request.abort();
            } else {
                request.continue();
            }
        });
    }

    async cleanUp() {
        return await this.browser.close();
    }

    async visit(url: string) {
        console.log(`Visiting ${url}`);
        await this.page.goto(url);
    }

    async get(url: string): Promise<string> {
        await this.visit(url);

        return await this.page.content();
    }

    async getJson(url: string): Promise<string> {
        await this.visit(url);

        return await this.pageJson();
    }

    async pageJson(): Promise<string> {
        return await this.page.evaluate(() => {
            return document.body.innerText;
        });
    }

    async requestMainPage(): Promise<boolean> {
        await this.get(this.endpoint);

        return false;
    }

    async delay(milliseconds: number, randomModifier: number = 1000) {
        await this.page.waitFor(milliseconds + Math.random() * randomModifier);
    }

    async httpRequest(type: string, url: string, data?, additionalHeaders: {[headerName: string]: string} = null) {
        var expression = function(type, url, data, additionalHeaders) {
            return new Promise((resolve, reject) => {
                var dataStr = JSON.stringify(data);
                var xhr = new XMLHttpRequest();
                xhr.open(type, url);
                if(dataStr !== "") {
                    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

                    if(additionalHeaders !== null) {
                        for(var headerName in additionalHeaders) {
                            var value = additionalHeaders[headerName];
                            xhr.setRequestHeader(headerName, value);
                        }
                    }
                }
                xhr.onload = function () {
                    if (this.status >= 200 && this.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject({
                            status: this.status,
                            statusText: xhr.statusText
                        });
                    }
                };
                xhr.onerror = function (ev) {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                };
                if(dataStr !== "") {
                    xhr.send(dataStr);
                } else {
                    xhr.send();
                }
            });
        };

        return await this.page.evaluate(expression, type, url, data, additionalHeaders);
    }

    async httpPost(url: string, data, additionalHeaders?: {[headerName: string]: string}) {
        console.log("POST: " + url);
        return await this.httpRequest("POST", url, data, additionalHeaders);
    }

    async httpPostWithUrlData(url: string, data) {
        console.log("POST: " + url + querystring.stringify(data));
        return await this.httpRequest("POST", url + querystring.stringify(data));
    }

    async httpGet(url: string) {
        console.log("GET: " + url);
        return await this.httpRequest("GET", url);
    }

    async authenticate(email: string, password: string, rememberMe: boolean = true): Promise<boolean> {
        var data = {
            "email": email,
            "password": password,
            "rememberMe": rememberMe
        };
        await this.page.goto(this.endpoint + "signin?redirectUrl=/", {
            waitUntil: 'networkidle0'
        });
        await this.page.waitFor(1000 + Math.random() * 1000);

        await this.page.type("#SignIn-emailInput", email);
        await this.page.waitFor(500 + Math.random() * 1000);
        await this.page.type("#SignIn-passwordInput", password);
        await this.page.waitFor(300 + Math.random() * 1000);
        await this.page.click("#SignIn-rememberMeDiv");
        await this.page.waitFor(1000 + Math.random() * 1000);
        await this.page.click("#SignIn-submitButton");

        await this.page.waitForNavigation();

        if (this.page.url() === this.endpoint) {
            return true;
        }

        return false;
    }

    imageUrlForItem(item: IReceiptItem):string {
        return `https://www.kroger.com/product/images/medium/front/${item.baseUpc}`
    }

    async receiptList(): Promise<IReceipt[]> {
        var resultString = await this.httpGet(this.endpoint + "mypurchases/api/v1/receipt/summary/by-user-id");

        var resultJson: any;
        try {
            resultJson = JSON.parse(resultString);
        } catch (error) {
            return [];
        }

        if (resultJson === null || resultJson["error"] !== undefined) {
            return [];
        }

        return resultJson;
    }

    async receiptData(receipt: IReceipt): Promise<IReceipt> {
        var data = {
            divisionNumber: receipt.receiptId.divisionNumber,
            storeNumber: receipt.receiptId.storeNumber,
            terminalNumber: receipt.receiptId.terminalNumber,
            transactionDate: receipt.receiptId.transactionDate,
            transactionId: receipt.receiptId.transactionId,
            shoppingContextDivision: receipt.receiptId.divisionNumber,
            shoppingContextStore: receipt.receiptId.storeNumber
        };

        var resultString = await this.httpPost(this.endpoint + "mypurchases/api/v1/receipt/detail", data);

        var resultJson: any;
        try {
            resultJson = JSON.parse(resultString);
        } catch (error) {
            return null;
        }

        if (resultJson === null || resultJson["error"] !== undefined) {
            return null;
        }

        return resultJson;
    }

    async searchRaw(query: string, startIndex: number = 0, count: number = 24): Promise<ISearch> {
        var data = {
            start: startIndex,
            count: count,
            query: query,
            tab: 0,
            monet: true
        };
        var resultString = await this.httpPostWithUrlData(this.endpoint + "search/api/searchAll?", data);

        var resultJson: any;
        try {
            resultJson = JSON.parse(resultString);
        } catch (error) {
            return null;
        }

        if (resultJson === null || resultJson["error"] !== undefined) {
            return null;
        }

        return resultJson;
    }

    async search(query: string, startIndex: number = 0, count: number = 24): Promise<ISearchDetailsProduct[]> {
        var searchResults = await this.searchRaw(query, startIndex, count);

        console.log("Retrieved search results");

        var upcs = searchResults.upcs;
        var products = (await this.productDetails(upcs, "00664", "701")).products;

        console.log("Retrived item details");

        return products;
    }

    async productDetails(upcs: string[], storeId: string, divisionId: string): Promise<ISearchDetails> {
        var data = {
            upcs: upcs,
            filterBadProducts: true
        };

        var headers = {
            "store-id": storeId,
            "division-id": divisionId
        }

        var resultString = await this.httpPost(this.endpoint + "products/api/products/details", data, headers);

        var resultJson: any;
        try {
            resultJson = JSON.parse(resultString);
        } catch (error) {
            return null;
        }

        if (resultJson === null || resultJson["error"] !== undefined) {
            return null;
        }

        return resultJson;
    }
}