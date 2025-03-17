# Set the working directory to the folder where the script is located (root of the project)
Set-Location -Path $PSScriptRoot

# Install the 'serve' package if it's not already installed
if (-not (Get-Command serve -ErrorAction SilentlyContinue)) {
    npm install -g serve
}

# Run the serve command on port 3005 without opening a console window
$command = "serve -s build -l 3005"
Start-Process powershell.exe -ArgumentList "-NoProfile -WindowStyle Hidden -Command $command" -WindowStyle Hidden
