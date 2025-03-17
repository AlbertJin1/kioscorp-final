# Navigate to the project directory
Set-Location -Path "C:\Users\awsom\Documents\GitHub\kioscorp-dashboard"

# Prevent the browser from opening by setting the BROWSER environment variable to "none"
$env:BROWSER = "none"

# Start the React application in the background
Write-Host "Starting the React application..."
$reactProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm start" -WindowStyle Hidden -PassThru

# Wait for the React app to fully start
Write-Host "Waiting for the React application to fully start..."
Start-Sleep -Seconds 10  # Adjust this delay as needed for your app

# Start the Electron application in the foreground
Write-Host "Starting the Electron application..."
$electronProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run electron" -WindowStyle Hidden -PassThru

# Monitor the Electron process
Wait-Process -Id $electronProcess.Id

# Electron app has closed; terminate the React process
Write-Host "Electron app closed. Stopping the React application..."
Stop-Process -Id $reactProcess.Id -Force

Write-Host "All processes stopped. Exiting script."
