import requests
from colorama import Fore, Style

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

def enviar_correo(correo, clave):
    destinatario_correo = input("Ingrese el correo del destinatario: ")
    asunto = input("Ingrese el asunto del correo: ")
    contenido = input("Ingrese el contenido del correo: ")
    data = {
        "remitenteCorreo": correo,
        "clave": clave,
        "destinatarioCorreo": destinatario_correo,
        "asunto": asunto,
        "contenido": contenido
    }
    url = f"{BASE_URL}/enviarcorreo"
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        resultado = response.json()
        print(resultado["mensaje"])
    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con la API: {e}")

def obtener_informacion_correo():
    correo_obtener = input("Ingrese el correo del cliente para obtener información: ")
    url = f"{BASE_URL}/informacion/{correo_obtener}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        resultado = response.json()
        print("Información del usuario:")
        print(f"Nombre: {resultado['nombre']}")
        print(f"Correo: {resultado['correo']}")
        print(f"Descripción: {resultado['descripcion']}")
    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con la API: {e}")

def bloquear_usuario(correo, clave):
    correo_bloquear = input("Ingrese el correo del usuario a bloquear: ")
    data = {
        "correo": correo,
        "clave": clave,
        "correo_bloquear": correo_bloquear
    }
    url = f"{BASE_URL}/bloquear"
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        resultado = response.json()
        print(resultado["mensaje"])
    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con la API: {e}")

def obtener_correos(correo, opcion):
    try:
        if opcion == 1:
            response = requests.get(f"{BASE_URL}/correosfavoritos/{correo}")
        else:
            response = requests.get(f"{BASE_URL}/obtenercorreos/{correo}")
        response.raise_for_status()
        correos = response.json()
        return correos
    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con la API: {e}")
        return []

def marcar_correo(correo, clave, id_correo, opcion):
    if opcion == 1:
        data = {
            "correo": correo,
            "clave": clave,
            "id_correo_favorito": id_correo
        }
    else:
        data = {
            "correo": correo,
            "clave": clave,
            "id_correo": id_correo
        }
    try:
        if opcion == 1:
            response = requests.post(f"{BASE_URL}/marcarcorreo", json=data)
        else:
            response = requests.delete(f"{BASE_URL}/desmarcarcorreo", json=data)
        response.raise_for_status()
        resultado = response.json()
        print(resultado["mensaje"])
    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con la API: {e}")

def mostrar_correos(correos, opcion):
    if opcion == 1:
        print("Correos favoritos:")
    else:
        print("Correos recibidos:")
    for correo in correos:
        remitente = correo['remitente']
        if isinstance(remitente, dict) and 'correo' in remitente:
            remitente_correo = remitente['correo']
        else:
            remitente_correo = remitente
        print(f"ID: {correo['id']}, De: {remitente_correo}, Asunto: {correo['asunto']}")
    print()


def visor_correos(correo, clave, opcion):
    if opcion == 1:
        correos = obtener_correos(correo, 1)
        mostrar_correos(correos, 1)
        id_correo = int(input("Ingrese el ID del correo que desea desmarcar como favorito (0 para salir): "))
        if id_correo != 0:
            marcar_correo(correo, clave, id_correo, 0)
    else:
        correos = obtener_correos(correo, 0)
        mostrar_correos(correos, 0)
        id_correo = int(input("Ingrese el ID del correo que desea marcar como favorito (0 para salir): "))
        if id_correo != 0:
            marcar_correo(correo, clave, id_correo, 1)
    print()

def menu_principal(correo, clave):
    while True:
        print("\n--★ Menú Principal ★--")
        print("1. Enviar un correo")
        print("2. Ver información de una dirección de correo electrónico")
        print("3. Bloquear usuario")
        print("4. Ver correos marcados como favoritos")
        print("5. Marcar correo como favorito")
        print("6. Cerrar sesion")
        opcion = input("Seleccione una opción: ")
        if opcion == "1":
            enviar_correo(correo, clave)
        elif opcion == "2":
            obtener_informacion_correo()
        elif opcion == "3":
            bloquear_usuario(correo, clave)
        elif opcion == "4":
            visor_correos(correo, clave, 1)
        elif opcion == "5":
            visor_correos(correo, clave, 0)
        elif opcion == "6":
            print("Saliendo...")
            break
        else:
            print("Opción no válida. Intente de nuevo.")

def menu_inicial():
    while True:
        print("\n--★ Bienvenido ★--")
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

communiken = """
   _____                                             _  _   __             
  /  __ \                                           (_)| | / /             
  | /  \/  ___   _ __ ___   _ __ ___   _   _  _ __   _ | |/ /   ___  _ __  
  | |     / _ \ | '_ ` _ \ | '_ ` _ \ | | | || '_ \ | ||    \  / _ \| '_ \ 
  | \__/\| (_) || | | | | || | | | | || |_| || | | || || |\  \|  __/| | | |
   \____/ \___/ |_| |_| |_||_| |_| |_| \__,_||_| |_||_|\_| \_/ \___||_| |_|
                                                                           
       
"""

if __name__ == "__main__":
    print(Fore.MAGENTA + communiken + Fore.RESET)
    menu_inicial()
