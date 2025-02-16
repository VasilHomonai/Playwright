const {test, expert, expect } = require('@playwright/test')

// ПРИ ЗАПУСКУ ТЕСТУ ПОТРІБНО В ТЕСТІ ПРОПИСАТИ ПРАВИЛЬНИЙ НОМЕР ТЕЛ. ТА ПАРОЛЬ, ТОБТО ТАКОГО КОРИСТУВАЧА ЩО ЗАРЕЄСТРОВАНИЙ НА САЙТІ!!!
// Всюди де номер "0000000000" змінити на правильний (в 3-ох місцях); також пароль "12345678" змінити на правильний (в 2-ох місцях)
// Substitution of incorrect data on the API side (Підміна некорекних даних на стороні API) Роблю таку реалізацію 2-ох тестів
// 1-ий кейс, це такий випадок, коли на фронті дані логіну та паролю вводяться правильнимі, а функція route в моменті відправлення даних на бек підмінить логін на некоректний.
// В першому кейсі, якщо запускати тест з браузером, то в бравзері дані логіну та паролю будуть відображатись правильно, на на бек підуть не правильно, буде відображатись помилка!
// Тестується сайт АЛЛО, запит який очікується для підміни в ньому даних: https://allo.ua/ua/customer/account/loginPostBeforeAuth
// В 2-му кейсі ми з правильними даними логуємось на сайт, на сторінку користувача в розділ корзини, а вже на ній по АПІ змінемо частину тексту на якесь Ім'я.
// Дані оба кейса переробив з тесту написаного під Pyton на Youtube: https://www.youtube.com/watch?v=S-TTbh0rmqc&ab_channel=SeniorTester%7C%D0%95%D0%B2%D0%B3%D0%B5%D0%BD%D0%B8%D0%B9%D0%9E%D0%BA%D1%83%D0%BB%D0%B8%D0%BA

const { route } = require('playwright')

    // Визначення функції для обробки маршруту для тесту 'substitute incorrect data on the API side'
async function changeRequest(route) {
    let data = await route.request().postData()
    // Логування data в консолі безпосередньо в changeRequest
    console.log("Logged from changeRequest:", data)
    // Пишемо підміну в запиті. Тобто користувач ввів свій номер тел. на фронті, а ми його підмінемо в запиті і відправимо на бек інший текст
    if (data) {
        data = data.replace('0000000000', 'qwerty')
        await route.continue({ postData: data })
      }
}

    // Визначення функції для обробки маршруту для тесту 'Change username on customer page'
    async function changeResponse(route) {
        const response = await route.fetch()
        let data = await response.text()
        // А в даному випадку робимо навпаки. Бек повертає html сторінку, ми її перехоплюємо і частину тексту на сторінці змінюємо на інший текст.
        data = data.replace('Ваш кошик порожній.', 'Тут був Вася!!!!!!!!!!!!!!')
        await route.fulfill({ response, body: data })
    }

    // Логуємо в консоль тільки ті повідомлення, які повертає функція changeRequest
    // Дана функція написалась для того, щоб в консоль виводити лише відповідний перехоплений запит для обробки, без всіх інших.
    async function setupConsoleLogging(page, filterText) {
      page.on('console', msg => {
        const messageText = msg.text()
        if (messageText.includes(filterText)) {
          console.log('Filtered log:', messageText)
        }
      })
    }


test('substitute incorrect data on the API side', async ({page}) => {

    const userlogin = page.locator('#customer-popup-menu')

     setupConsoleLogging(page, 'substitute incorrect data on the API side log')
     // Даний роут відслідковує відпрацювання заданого запиту, і коли він відпрацює, то спрацює функція changeRequest
     await page.route(new RegExp('customer/account/loginPostBeforeAuth/'), changeRequest)
     await page.goto('https://allo.ua/ua/customer/account/login/')
     await page.getByRole('button', { name: 'Логін та пароль' }).click()
     await page.getByRole('textbox', { name: 'Телефон або ел. пошта' }).click()
     await page.getByRole('textbox', { name: 'Телефон або ел. пошта' }).fill('0000000000')
     await page.getByRole('textbox', { name: 'Пароль' }).click()
     await page.getByRole('textbox', { name: 'Пароль' }).fill('12345678')
     await page.getByRole('button', { name: 'Увійти' }).click()
     // При кліку на кнопку 'Увійти' і викликається даний запит, який прослуховує route, і на даному етапі і підмінить логін
     await expect(page.getByText('Неправильне значення поля телефону або ел.пошти')).toBeVisible()
     //Робимо скрін, що візуально номер телефону виглядить правильним, але авторизуватись не вийшло!
     await userlogin.screenshot({path: 'Image/userlogin.jpg' })
     //await page.waitForTimeout(5000)
}
)

test('Change username on customer page', async ({page}) => {

    //const usercart = page.locator('.cart-popup__content')
    const usercart = page.locator('[id="__layout"] div').filter({ hasText: 'Кошик (0' }).nth(3)
    // Даний роут відслідковує відпрацювання заданого запиту, і коли він відпрацює, то спрацює функція changeResponse
    await page.route(new RegExp('index'), changeResponse)
    await page.goto('https://allo.ua/ua/customer/account/login/')
    await page.getByRole('button', { name: 'Логін та пароль' }).click()
    await page.getByRole('textbox', { name: 'Телефон або ел. пошта' }).click()
    await page.getByRole('textbox', { name: 'Телефон або ел. пошта' }).fill('0000000000')
    await page.getByRole('textbox', { name: 'Пароль' }).click()
    await page.getByRole('textbox', { name: 'Пароль' }).fill('12345678')
    await page.getByRole('button', { name: 'Увійти' }).click()
    await page.getByRole('link', { name: 'Кошик (0)' }).click() 
    //  Після кліку на таб кошика відразу на сторінці відображається правильний текст сторінки і робимо відразу її скрін, а через 2 сек. як відпрацює функція підміни
    //  то на сторінці частина тексту зміниться на заданий, і також зробимо скрін
    await usercart.screenshot({path: 'Image/usercart_before.jpg' })
    await page.waitForTimeout(2000)
    await usercart.screenshot({path: 'Image/usercart_after.jpg' })  
  }
)

     // Запуск даного тесту з відображенням кроків з одним браузером:
     // npx playwright test tests/data-substitution-api-side.spec.js --headed --project=chromium

     // Запуск даного тесту з відображенням кроків з одним браузером + дебаг режим (покрокове відслідковування вручному режимі):
     // npx playwright test tests/data-substitution-api-side.spec.js --headed --debug --project=chromium

     // Так можна запустити конкретний тест, коли їх є декілька у 1-му файлі:
     // npx playwright test tests/data-substitution-api-side.spec.js --grep "Change username on customer page" --headed --project=chromium