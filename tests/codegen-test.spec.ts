import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  const title = page.locator('[data-testid="todo-title"]')
  const placeholder = page.locator('input.new-todo')
  const checkboxes = page.locator('input.toggle')
  const buttondelete = page.locator('button.destroy')
  const fills = page.getByRole('textbox', { name: 'What needs to be done?' })

  await page.goto('https://demo.playwright.dev/todomvc/#/')
  await fills.click();
  await fills.fill('Перша справа')
  await fills.press('Enter')
  await fills.fill('Друга справа')
  await fills.press('Enter')
  await fills.fill('Третя справа-зліва')
  await fills.press('Enter')
  // Провірка присутності всіх 3-ох елементів на сторінці
  await expect(title).toHaveCount(3)

  // Провірка елементів які вибрані, а які не вибрані.
  await page.getByRole('listitem').filter({ hasText: 'Третя справа-зліва' }).getByLabel('Toggle Todo').check()
  await expect(checkboxes.first()).not.toBeChecked()
  await expect(checkboxes.nth(1)).not.toBeChecked()
  await expect(checkboxes.nth(2)).toBeChecked()

  await page.getByRole('link', { name: 'Completed' }).click()
  // Провірка, що на сторінці 1 елемент
  await expect(title).toHaveCount(1)
  
  // 1-ий спосіб провірки присутності кнопки видалення елементів на сторінці
  await title.first().hover()
  //await page.waitForTimeout(2000)
  await expect(buttondelete.first()).toBeVisible()
  // 2-ий спосіб провірки присутності кнопки видалення елементів на сторінці. Правильний спосіб
  await buttondelete.first().focus()
  //await page.waitForTimeout(2000)
  await expect(buttondelete.first()).toBeVisible()

  await page.getByRole('link', { name: 'Active' }).click()
  // Провірка, що на сторінці 2 елемента
  await expect(title).toHaveCount(2)

  // 1-ий спосіб провірки присутності кнопки видалення елементів на сторінці
  await title.first().hover()
  //await page.waitForTimeout(2000)
  await expect(buttondelete.first()).toBeVisible()
  // 2-ий спосіб провірки присутності кнопки видалення елементів на сторінці. Правильний спосіб
  await buttondelete.first().focus()
  //await page.waitForTimeout(2000)
  await expect(buttondelete.first()).toBeVisible({timeout: 1000})

  await title.nth(1).hover()
  //await page.waitForTimeout(2000)
  await expect(buttondelete.nth(1)).toBeVisible()
  // 2-ий спосіб провірки присутності кнопки видалення елементів на сторінці. Правильний спосіб
  await buttondelete.nth(1).focus()
  //await page.waitForTimeout(2000)
  await expect(buttondelete.nth(1)).toBeVisible()

  //Провірка placeholder що він заданий 
  await expect(placeholder).toHaveAttribute('placeholder', 'What needs to be done?')

  await page.screenshot({path: 'Image/sreenpage.jpg'})
  await placeholder.screenshot({path: 'Image/placeholder.jpg'})
})