const {test, expert, expect } = require('@playwright/test')

test('First test', async ({page}) => {
    const element = page.locator('[data-testid="todo-title"]')
    await page.goto('https://demo.playwright.dev/todomvc/#/')
    //await page.waitForTimeout(2000)
    await page.locator('input').type('My first test on the demo')
    //await page.waitForTimeout(2000)
    await page.locator('input').press('Enter')
    //await page.waitForTimeout(2000)
    //await page.locator(element).waitFor({ state: 'attached' })
    await expect(element).toHaveText('My first test on the demo')
})