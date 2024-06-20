import requests

BASE_URL = 'http://localhost:3000/api'

def registrar_usuario():
    nombre = input("Ingrese su nombre: ")
    correo = input("Ingrese su correo electrónico: ")
    clave = input("Ingrese su clave: ")
    descripcion = input("Ingrese una descripción: ")
    data = {
        "nombre": nombre,
        "correo": correo,
        "clave": clave,
        "descripcion": descripcion
    }
    url = f"{BASE_URL}/registrar"
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        resultado = response.json()
        print(resultado["mensaje"])
    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con la API: {e}")

def iniciar_sesion():
    correo = input("Ingrese su correo electrónico: ")
    clave = input("Ingrese su clave: ")
    data = {
        "correo": correo,
        "clave": clave
    }
    url = f"{BASE_URL}/login"
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        resultado = response.json()
        if resultado["estado"] == 200:
            print("Inicio de sesión exitoso")
            menu_principal(correo, clave)
        else:
            print("Credenciales inválidas")
    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con la API: {e}")

def menu_principal(correo, clave):
    while True:
        print("\n--- Menú Principal ---")
        print("1. Enviar un correo")
        print("2. Ver información de una dirección de correo electrónico")
        print("3. Ver correos marcados como favoritos")
        print("4. Marcar correo como favorito")
        print("5. Salir")
        opcion = input("Seleccione una opción: ")
        if opcion == "1":
            print("Funcionalidad de enviar un correo (por implementar)")
        elif opcion == "2":
            print("Funcionalidad de ver información (por implementar)")
        elif opcion == "3":
            print("Funcionalidad de ver correos favoritos (por implementar)")
        elif opcion == "4":
            print("Funcionalidad de marcar correo como favorito (por implementar)")
        elif opcion == "5":
            print("Saliendo...")
            break
        else:
            print("Opción no válida. Intente de nuevo.")

def menu_inicial():
    while True:
        print("\n--- Menú Inicial ---")
        print("1. Registrarse")
        print("2. Iniciar sesión")
        print("3. Salir")
        opcion = input("Seleccione una opción: ")
        if opcion == "1":
            registrar_usuario()
        elif opcion == "2":
            iniciar_sesion()
        elif opcion == "3":
            print("Saliendo...")
            break
        else:
            print("Opción no válida. Intente de nuevo.")

if __name__ == "__main__":
    menu_inicial()
