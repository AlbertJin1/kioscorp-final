import socket
import json
import subprocess

def start_server():
    host = '0.0.0.0'  # Allows connections from any IP
    port = 8001  # Use port 8001 for the print server

    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((host, port))
    server_socket.listen(5)  # Allow up to 5 pending connections

    print(f"Print server listening on port {port}")

    while True:
        client_socket, address = server_socket.accept()
        print(f"Connection from {address}")

        try:
            # Receive data in chunks to handle larger messages
            data = b''
            while True:
                part = client_socket.recv(1024)
                data += part
                if len(part) < 1024:  # If the received part is less than the buffer size, we assume it's done
                    break

            print_data = json.loads(data.decode('utf-8'))
            print("Received print data:", print_data)

            # Call the print script with the received data
            subprocess.run(['python', 'print_receipt.py', json.dumps(print_data)], check=True)
            client_socket.send("Print job completed successfully".encode('utf-8'))

        except json.JSONDecodeError as e:
            error_message = f"Failed to decode JSON: {str(e)}"
            print(error_message)
            client_socket.send(error_message.encode('utf-8'))
        except subprocess.CalledProcessError as e:
            error_message = f"Print job failed: {str(e)}"
            print(error_message)
            client_socket.send(error_message.encode('utf-8'))
        except Exception as e:
            error_message = f"An unexpected error occurred: {str(e)}"
            print(error_message)
            client_socket.send(error_message.encode('utf-8'))
        finally:
            client_socket.close()  # Ensure the client socket is closed

if __name__ == "__main__":
    start_server()