
const puppeteer = require("puppeteer"); //equivelant to import for other languagues, imports the puppeter api
const assert = require("./assert.js")

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

//this is how u declare a function, function then name with variables in paranthesis, no type casting needed
async function scrapeGPUS(scrapeInfo) { //async so that you can use await, make it so that function waits for responses from other code
    const browser = await puppeteer.launch({ headless: false });

    var pageFDT = [];
    let result = null; //let means type can also change
    let error_log = null;
    var pagenumber = 0;

    for (i = 0; i < scrapeInfo.urls.list.length; i++) {
        pageFDT[i] = await browser.newPage(); //creates a new page in the browser, then save that page instance in my page list
    }

    var sign_in_page = await browser.newPage();

    await sign_in_page.goto(scrapeInfo.urls.list[0]);

    await sign_in_page.waitForSelector(scrapeInfo.account_button);
    await sign_in_page.click(scrapeInfo.account_button);

    await sign_in_page.waitForSelector(scrapeInfo.sign_in_prompt);
    await sign_in_page.click(scrapeInfo.sign_in_prompt);

    await sign_in_page.waitForSelector(scrapeInfo.email); //wait for email submision text box, once thats there its known the rest of these buttons are too
    await sign_in_page.type(scrapeInfo.email, "hello", { delay: 50 });
    await sign_in_page.type(scrapeInfo.pass, "world", { delay: 50 }); //delays to make it not seem to fast and automatic
    await sign_in_page.click(scrapeInfo.sign_in_submit, { delay: 100 });

    result = await sign_in_page.waitForSelector(scrapeInfo.menu, { timeout: 1000 });

    await sign_in_page.close();

    for (i = 0; i < scrapeInfo.urls.list.length; i++) {
        await pageFDT[i].goto(scrapeInfo.urls.list[i]); //for every page go to a specific link
    }

    result = null;
    let check = async () => {
        while (result == null) {

            for (i = 0; i < pageFDT.length; i++) {
                result = await pageFDT[i].$(scrapeInfo.addToCart); //after reloading every page, check for add to cart
                pagenumber = i; //saves which page has add to cart
                if (result != null) {
                    pageFDT[i].click(scrapeInfo.addToCart);
                    break;
                }
            }

            if (result != null) break;

            for (i = 0; i < pageFDT.length; i++) {
                await pageFDT[i].reload();
            }
        }
        console.log("Going to found")
        found();
    }

    let found = async () => {

        await pageFDT[pagenumber].waitForSelector(scrapeInfo.goToCart);
        result = await pageFDT[pagenumber].$(scrapeInfo.goToCart); //double check that there is a button to press, if not then go back to checking
        if (result == null) check();
        await pageFDT[pagenumber].click(scrapeInfo.goToCart);

        /*wait pageFDT[pagenumber].waitForSelector(scrapeInfo.checkout);
        result = await pageFDT[pagenumber].$(scrapeInfo.checkout);
        if (result == null) check();
        await pageFDT[pagenumber].click(scrapeInfo.checkout);*/

        assert.bought(scrapeInfo.urlDict[scrapeInfo.urls.list[pagenumber]]) //gets url then uses it to index bought item name
    }


    check();
    //console.log(result);

    //browser.close();
}



const gpu3070 = "https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442";
const ninSwitch = "https://www.bestbuy.com/site/nintendo-switch-32gb-console-gray-joy-con/6364253.p?skuId=6364253";


var urlDict = { //this is just an object, can also just use the notation "new Object();", can add by using index notation, urlDict[item] = newItem
    list : [gpu3070, gpu3070]
} //use dot notaion to access items that arent a type such as list
//objects in javascript are very similar to dictionarys

urlDict[gpu3070] = "RTX 3070";
urlDict[ninSwitch] = "Nintendo Switch";

for (i = 0; i < urlDict.list.length; i++) {
    //console.log(urlDict[urlDict.list[i]] + " test");
    assert.assert(1 == 1, "test")
}

const scInf = {
    urls: urlDict,
    addToCart: ".add-to-cart-button svg",
    goToCart: ".go-to-cart-button a", //go to cart command
    checkout: ".checkout-buttons__checkout, .checkout-buttons__share-cart-button",
    survey: "#fuk", //forgot to get survey button info, needed
    email: "#fld-e",
    pass: "#fld-p1",
    account_button: ".account-button svg",
    sign_in_prompt: "#account-menu-app .abt-2465-menu-header .lam-signIn__button",
    sign_in_submit: ".cia-form__controls__submit",
    menu: ".hamburger-menu-button"
}

scrapeGPUS(scInf);