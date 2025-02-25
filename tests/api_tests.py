import pytest
import requests

base_url = "https://api.restful-api.dev/objects"

@pytest.fixture
def create_object():
        payload = {
            "name": "Apple MacBook Pro 16 Vasyl",
            "data": {
                "year": 2020,
                "price": 1849.99,
                "CPU model": "Intel Core i9",
                "Hard disk size": "1 TB"
            }
        }
        response = requests.post(base_url, json=payload)
        assert response.status_code == 200  # Переконуємося, що об'єкт створено успішно
        response_data = response.json()
        return response_data  # Повертаємо всю відповідь у форматі json для подальших провірок

@pytest.fixture
def delete_object():
        # Фікстура для видалення об'єкта після всіх провірок у кожному тесті
        def _delete(obj_id):
            response = requests.delete(f"{base_url}/{obj_id}")
            assert response.status_code in [200, 204]  # Успішне видалення
        return _delete


def test_create_object(create_object, delete_object):
        assert create_object['name'] == "Apple MacBook Pro 16 Vasyl"
        assert create_object['data']['year'] == 2020
        assert create_object['data']['price'] == 1849.99
        assert create_object['data']['CPU model'] == "Intel Core i9"
        assert create_object['data']['Hard disk size'] == "1 TB"

        # Видаляємо об'єкт використовуючи фікстуру delete_object
        delete_object(create_object['id'])

def test_get_object(create_object, delete_object):
        response = requests.get(f'{base_url}/{create_object['id']}')
        assert response.status_code == 200 # Переконуємося, що запит виконано успішно
        response_data = response.json()
        assert response_data.get('id') == create_object['id']  # Переконуємося, що отримали правильний об'єкт

        # Видаляємо об'єкт використовуючи фікстуру delete_object
        delete_object(create_object['id'])

def test_put_object(create_object, delete_object):
        updated_payload = {
            "name": "Apple MacBook Pro 16 Andy",
               "data": {
                  "year": 2022,
                  "price": 1999.99,
                  "CPU model": "Intel Core i7",
                  "Hard disk size": "2 TB"
               }
        }
        put_response = requests.put(f'{base_url}/{create_object['id']}', json=updated_payload)
        assert put_response.status_code == 200  # Перевіряємо статус-код відповіді
        put_response_data = put_response.json()
        assert put_response_data['name'] == "Apple MacBook Pro 16 Andy"
        assert put_response_data['data']['year'] == 2022
        assert put_response_data['data']['price'] == 1999.99
        assert put_response_data['data']['CPU model'] == "Intel Core i7"
        assert put_response_data['data']['Hard disk size'] == "2 TB"

        # Видаляємо об'єкт використовуючи фікстуру delete_object
        delete_object(create_object['id'])

def test_del_object(create_object, delete_object):
        object_id = create_object['id']  # Отримуємо ID створеного об'єкта

        # Видаляємо об'єкт використовуючи фікстуру delete_object
        delete_object(object_id)

        # Перевіряємо, що об'єкт більше не існує
        get_response = requests.get(f'{base_url}/{object_id}')
        assert get_response.status_code == 404  # Має повертати 404 Not Found
