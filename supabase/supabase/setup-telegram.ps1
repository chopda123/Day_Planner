# Telegram Bot Setup Script
Write-Host "Setting up Telegram webhook..." -ForegroundColor Cyan

# Bot Token
$botToken = "8040279503:AAGFEEGGMjwSjLwCdvz9UbiTVMnzpfSO8Xs"

# Function URL
$functionUrl = "https://xrnnqokhafpbbfcxpymq.functions.supabase.co/functions/v1/telegram-bot"

# 1. Delete existing webhook
Write-Host "Deleting old webhook..." -ForegroundColor Yellow
$deleteResult = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/deleteWebhook" -Method Get
Write-Host "Deleted: $($deleteResult.ok)"

# 2. Set new webhook
Write-Host "Setting new webhook..." -ForegroundColor Yellow
$webhookConfig = @{
    url = $functionUrl
    drop_pending_updates = $true
    allowed_updates = @("message", "callback_query")
}

$jsonConfig = $webhookConfig | ConvertTo-Json

$setResult = Invoke-RestMethod `
    -Uri "https://api.telegram.org/bot$botToken/setWebhook" `
    -Method Post `
    -ContentType "application/json" `
    -Body $jsonConfig

Write-Host "Set webhook: $($setResult.ok)"
Write-Host "Description: $($setResult.description)"

# 3. Verify
Write-Host "`nVerifying webhook..." -ForegroundColor Yellow
$verifyResult = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo" -Method Get

Write-Host "Webhook URL: $($verifyResult.result.url)"
Write-Host "Pending updates: $($verifyResult.result.pending_update_count)"
Write-Host "Last error: $($verifyResult.result.last_error_message)"

# 4. Test instructions
Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Green
Write-Host "1. Open Telegram and message @improve_your_life_bot"
Write-Host "2. Send the command: /start"
Write-Host "3. Check Supabase logs for activity"