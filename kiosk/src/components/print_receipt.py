import sys
import json
import usb.core
import usb.util

# Initialize the USB printer
printer = usb.core.find(idVendor=0x0fe6, idProduct=0x811e)  # Use your printer's ID here
if printer is None:
    raise ValueError('Printer not found')

# Detach the kernel driver if necessary
if printer.is_kernel_driver_active(0):
    printer.detach_kernel_driver(0)

# Set the active configuration
printer.set_configuration()

# Get the print data from command-line argument
print_data = json.loads(sys.argv[1])

# Sending commands to the printer
# ESC @: Initialize printer
printer.write(1, b'\x1B\x40')

# Center the header
max_width = 32  # Adjusted width for a 58mm thermal printer
header1 = " Universal Auto Supply and Bolt".center(max_width)
header2 = "Center".center(max_width)
header3 = "Cagayan de Oro, Philippines".center(max_width)

# Print the receipt layout
printer.write(1, f"{header1}\n".encode('utf-8'))
printer.write(1, f"{header2}\n".encode('utf-8'))
printer.write(1, f"{header3}\n".encode('utf-8'))

# Add blank lines for spacing
for _ in range(2):
    printer.write(1, b'\n')

# Print the order ID
order_id = print_data.get('order_id', 'Unknown Order ID')
printer.write(1, f"Order ID: {order_id}\n".encode('utf-8'))
printer.write(1, f"Queue Number:\n".encode('utf-8'))

# Print the queue number
queue_number = print_data.get('queue_number', 0)

# Set the font size to a larger size (double height for queue number)
printer.write(1, b'\x1B\x21\x10')  # Set double height

# Center the queue number
queue_number_str = str(queue_number).center(max_width)
printer.write(1, f"{queue_number_str}\n".encode('utf-8'))

# Reset the font size back to normal
printer.write(1, b'\x1B\x21\x00')

# Determine the message based on the queue number
if queue_number > 1:
    ahead_of_you = queue_number - 1
    message = f"({ahead_of_you} ahead of you)"
elif queue_number == 1:
    message = "(You are next)"
else:
    message = "N/A (No one ahead)"

# Center the message
centered_message = message.center(max_width)
printer.write(1, f"{centered_message}\n\n".encode('utf-8'))

# Add a blank line after date and time
printer.write(1, b'\n')

# Skip item details and proceed directly to total amount

# Print the total amount label
printer.write(1, "Total:\n".encode('utf-8'))

# Set double-height font for total amount
printer.write(1, b'\x1B\x21\x10')  # Double height for total

# Format and print the total amount in larger font
total = float(print_data['total'])
total_str = f"{total:.2f}".center(max_width)
printer.write(1, f"{total_str}\n".encode('utf-8'))

# Reset the font size back to normal
printer.write(1, b'\x1B\x21\x00')

# Add blank lines for spacing
for _ in range(3):
    printer.write(1, b'\n')

# Print a thank you message
thank_you = "Proceed to the Cashier".center(max_width)
printer.write(1, f"{thank_you}\n".encode('utf-8'))

# Add Powered by KiosCorp at the bottom
powered_by = "Powered by KiosCorp".center(max_width)
printer.write(1, f"{powered_by}\n".encode('utf-8'))

# Print more blank lines for spacing
for _ in range(4):
    printer.write(1, b'\n')

# ESC E: Print and feed paper
printer.write(1, b'\x1B\x45')

# ESC @: Initialize printer
printer.write(1, b'\x1B\x40')

