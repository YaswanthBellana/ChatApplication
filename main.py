import socket
import threading
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from base64 import b64encode, b64decode
import tkinter as tk
from tkinter import scrolledtext, simpledialog, messagebox

KEY = b'abcdefghijklmnop'

def encrypt(plaintext):
    cipher = AES.new(KEY, AES.MODE_CBC)
    ct_bytes = cipher.encrypt(pad(plaintext.encode(), AES.block_size))
    iv = b64encode(cipher.iv).decode('utf-8')
    ct = b64encode(ct_bytes).decode('utf-8')
    return iv, ct

def decrypt(iv, ciphertext):
    iv = b64decode(iv)
    ct = b64decode(ciphertext)
    cipher = AES.new(KEY, AES.MODE_CBC, iv)
    pt = unpad(cipher.decrypt(ct), AES.block_size).decode('utf-8')
    return pt

def receive_messages():
    while True:
        try:
            message = client_socket.recv(1024).decode('utf-8')
            if message.startswith('[ENCRYPTED]'):
                message = message.replace('[ENCRYPTED]', '')
                iv, ciphertext = message.split(':')
                plaintext = decrypt(iv, ciphertext)
                message = plaintext
            msg_list.insert(tk.END, message)
            msg_list.see(tk.END)
        except Exception as e:
            print("[EXCEPTION]", e)
            break

def send_message(event=None):
    message = my_msg.get()
    if message:
        if len(connected_users) == 0:
            messagebox.showwarning("No User", "No users connected to chat.")
            return
        elif len(connected_users) == 1:
            recipient = connected_users[0]
        else:
            recipient = simpledialog.askstring("Recipient", "Enter recipient IP address:")
            if recipient not in connected_users:
                messagebox.showwarning("Invalid User", "Recipient not in the chat.")
                return

        if len(message) > 200:
            messagebox.showwarning("Message too long", "Maximum message length is 200 characters.")
            return

        if len(connected_users) > 1:
            message = '[ENCRYPTED]' + ''.join(encrypt(message))
        
        client_socket.send(bytes(message, 'utf-8'))
        if message == "{quit}":
            client_socket.close()
            top.quit()
    my_msg.set("")

def on_closing(event=None):
    my_msg.set("{quit}")
    send_message()

def update_users_list(users):
    connected_users.clear()
    for user in users.split(","):
        connected_users.append(user.strip())

# GUI setup
top = tk.Tk()
top.title("LAN Messenger")

messages_frame = tk.Frame(top)
my_msg = tk.StringVar()
my_msg.set("")
scrollbar = tk.Scrollbar(messages_frame)
msg_list = scrolledtext.ScrolledText(messages_frame, height=15, width=50, yscrollcommand=scrollbar.set)
scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
msg_list.pack(side=tk.LEFT, fill=tk.BOTH)
msg_list.config(state=tk.DISABLED)
messages_frame.pack()

entry_field = tk.Entry(top, textvariable=my_msg)
entry_field.bind("<Return>", send_message)
entry_field.pack()
send_button = tk.Button(top, text="Send", command=send_message)
send_button.pack()

HOST = "127.0.0.1"
PORT = 12345
ADDR = (HOST, PORT)

connected_users = []

try:
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect(ADDR)
except Exception as e:
    print("[EXCEPTION]", e)
    messagebox.showerror("Connection Error", "Failed to connect to the server.")
    top.quit()

username = simpledialog.askstring("Username", "Enter your username:")
client_socket.send(bytes(username, "utf-8"))

receive_thread = threading.Thread(target=receive_messages)
receive_thread.start()

while True:
    try:
        users = client_socket.recv(1024).decode("utf-8")
        if users.startswith('[USERS]'):
            users = users.replace('[USERS]', '')
            update_users_list(users)
    except Exception as e:
        print("[EXCEPTION]", e)
        break

top.protocol("WM_DELETE_WINDOW", on_closing)
tk.mainloop()
