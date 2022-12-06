const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    const USER = {
        USERNAME: 'standard_user',
        PASSWORD: 'secret_sauce'
    };
    const fieldUsername = page.locator('#user-name');
    const fieldPassword = page.locator('#password');
    const buttonSubmit  = page.getByText('LOGIN');

    await fieldUsername.fill(USER.USERNAME);
    await fieldPassword.fill(USER.PASSWORD);
    await buttonSubmit.click();

    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator('.title')).toHaveText('Products');
});


const ITEMS = [
    'Sauce Labs Bike Light',
    'Sauce Labs Backpack',
    'Test.allTheThings() T-Shirt (Red)'
];

test.describe('Checkout items', () => {

    const checkoutFirstName = 'John';
    const checkoutLastName  = 'Doe'
    const postalCode        = '1000';

    test('Test 1: Checkout one item', async ({ page }) => {

        const ITEM = [ITEMS[0]];
        addItemsToCart(page, ITEM);
        await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
        await page.locator('.shopping_cart_link').click();
        
        await expect(page).toHaveURL(/.*cart.html/);
        await expect(page.locator('.title')).toHaveText('Your Cart');
        await expect(page.locator('.cart_item')).toHaveCount(1);
        checkIfItemsExistInList(page, ITEM);
        await page.locator('#checkout').click();
        
        await expect(page).toHaveURL(/.*checkout-step-one.html/);
        await expect(page.locator('.title')).toHaveText('Checkout: Your Information');
        await page.getByPlaceholder('First Name').fill(checkoutFirstName);
        await page.getByPlaceholder('Last Name').fill(checkoutLastName);
        await page.getByPlaceholder('Zip/Postal Code').fill(postalCode);
        await page.locator('#continue').click();

        await expect(page).toHaveURL(/.*checkout-step-two.html/);
        await expect(page.locator('.title')).toHaveText('Checkout: Overview');
        await expect(page.locator('.cart_item')).toHaveCount(1);
        checkIfItemsExistInList(page, ITEM);
        await page.locator('#finish').click();

        await expect(page).toHaveURL(/.*checkout-complete.html/);
        await expect(page.locator('.title')).toHaveText('Checkout: Complete!');
        await expect(page.locator('.complete-header')).toHaveText('THANK YOU FOR YOUR ORDER');
        await page.locator('#back-to-products').click();

        await expect(page).toHaveURL(/.*inventory.html/);
        await expect(page.locator('.title')).toHaveText('Products');
    });

    test('Test 2: Checkout multiple items', async ({ page }) => {

        // Add the 3 items to cart
        addItemsToCart(page, ITEMS);
        await expect(page.locator('.shopping_cart_badge')).toHaveText('3');
        await page.locator('.shopping_cart_link').click();

        await expect(page).toHaveURL(/.*cart.html/);
        await expect(page.locator('.title')).toHaveText('Your Cart');
        await expect(page.locator('.cart_item')).toHaveCount(3);

        checkIfItemsExistInList(page, ITEMS);
        await page.locator('#checkout').click();

        await expect(page).toHaveURL(/.*checkout-step-one.html/);
        await expect(page.locator('.title')).toHaveText('Checkout: Your Information');
        await page.getByPlaceholder('First Name').fill(checkoutFirstName);
        await page.getByPlaceholder('Last Name').fill(checkoutLastName);
        await page.getByPlaceholder('Zip/Postal Code').fill(postalCode);
        await page.locator('#continue').click();

        await expect(page).toHaveURL(/.*checkout-step-two.html/);
        await expect(page.locator('.title')).toHaveText('Checkout: Overview');
        await expect(page.locator('.cart_item')).toHaveCount(3);
        checkIfItemsExistInList(page, ITEMS);
        await page.locator('#finish').click();

        await expect(page).toHaveURL(/.*checkout-complete.html/);
        await expect(page.locator('.title')).toHaveText('Checkout: Complete!');
        await expect(page.locator('.complete-header')).toHaveText('THANK YOU FOR YOUR ORDER');
        await page.locator('#back-to-products').click();

        await expect(page).toHaveURL(/.*inventory.html/);
        await expect(page.locator('.title')).toHaveText('Products');
    });

    test('Test 3: Add 3 items to cart but only checkout 2', async ({ page }) => {

        // Add the 3 items to cart
        addItemsToCart(page, ITEMS);
        await expect(page.locator('.shopping_cart_badge')).toHaveText('3');
        await page.locator('.shopping_cart_link').click();

        await expect(page).toHaveURL(/.*cart.html/);
        await expect(page.locator('.title')).toHaveText('Your Cart');
        await expect(page.locator('.cart_item')).toHaveCount(3);
        checkIfItemsExistInList(page, ITEMS);

        // Remove second item in the array
        await page.locator('.cart_item').filter({ hasText: ITEMS[1] }).getByRole('button', { name: 'Remove' }).click();
        await expect(page.locator('.cart_item')).toHaveCount(2);

        const modified_items = ITEMS.filter((e) => { return e != ITEMS[1] });
        checkIfItemsExistInList(page, modified_items);
        await page.locator('#checkout').click();

        await expect(page).toHaveURL(/.*checkout-step-one.html/);
        await expect(page.locator('.title')).toHaveText('Checkout: Your Information');
        await page.getByPlaceholder('First Name').fill(checkoutFirstName);
        await page.getByPlaceholder('Last Name').fill(checkoutLastName);
        await page.getByPlaceholder('Zip/Postal Code').fill(postalCode);
        await page.locator('#continue').click();

        await expect(page).toHaveURL(/.*checkout-step-two.html/);
        await expect(page.locator('.title')).toHaveText('Checkout: Overview');
        await expect(page.locator('.cart_item')).toHaveCount(2);
        checkIfItemsExistInList(page, modified_items);
        await page.locator('#finish').click();

        await expect(page).toHaveURL(/.*checkout-complete.html/);
        await expect(page.locator('.title')).toHaveText('Checkout: Complete!');
        await expect(page.locator('.complete-header')).toHaveText('THANK YOU FOR YOUR ORDER');
        await page.locator('#back-to-products').click();

        await expect(page).toHaveURL(/.*inventory.html/);
        await expect(page.locator('.title')).toHaveText('Products');
    });
});

async function addItemsToCart(page, ITEMS_TO_ADD) {
    for(const item of ITEMS_TO_ADD) {
        await page.locator('.inventory_item').filter({ hasText: item }).getByRole('button', { name: 'Add to cart' }).click();
    }
}

async function checkIfItemsExistInList(page, ITEMS_TO_CHECK) {
    for(const item of ITEMS_TO_CHECK) {
        await expect(page.locator('.inventory_item_name').filter({ hasText: item })).toHaveText(item);
    }
}