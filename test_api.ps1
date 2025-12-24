# ===================================
# SCRIPT DE PRUEBAS COMPLETO - EXPOL API
# ALEXANDRE ICAZA
# ===================================

$baseUrl = "http://localhost:9292"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   PRUEBAS API EXPOL - ALEXANDRE ICAZA" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ===================================
# PRUEBA 1: HEALTH CHECK
# ===================================
Write-Host "PRUEBA 1: Health Check" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $health = Invoke-WebRequest -Uri "$baseUrl/health" | Select-Object -Expand Content
    Write-Host $health -ForegroundColor White
    Write-Host "PASO`n" -ForegroundColor Green
} catch {
    Write-Host "FALLO: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ===================================
# PRUEBA 2: LOGIN
# ===================================
Write-Host "PRUEBA 2: Login de Usuario" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/login" -Method POST -Body (@{
        email = "alexandre.icaza@espol.edu.ec"
        password = "password123"
    } | ConvertTo-Json) -ContentType "application/json"
    
    $loginData = $response.Content | ConvertFrom-Json
    $token = $loginData.token
    
    Write-Host "Token: $token" -ForegroundColor Yellow
    Write-Host $response.Content -ForegroundColor White
    Write-Host "PASO`n" -ForegroundColor Green
} catch {
    Write-Host "FALLO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Respuesta: $($_.ErrorDetails.Message)`n" -ForegroundColor Red
    Write-Host "Asegurate de ejecutar: bundle exec rails db:seed`n" -ForegroundColor Yellow
    exit
}

# ===================================
# PRUEBA 3: LISTAR PUBLICACIONES
# ===================================
Write-Host "PRUEBA 3: Listar Publicaciones" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $listings = Invoke-WebRequest -Uri "$baseUrl/api/v1/listings" | Select-Object -Expand Content
    Write-Host $listings -ForegroundColor White
    Write-Host "PASO`n" -ForegroundColor Green
} catch {
    Write-Host "FALLO: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ===================================
# PRUEBA 4: CREAR PUBLICACION
# ===================================
Write-Host "PRUEBA 4: Crear Nueva Publicacion" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/listings" -Method POST -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } -Body (@{
        listing = @{
            title = "MacBook Pro 2020 - Como Nueva"
            description = "MacBook Pro 13 pulgadas, modelo 2020. Intel Core i5, 8GB RAM, 256GB SSD. Incluye cargador original y estuche."
            price = 850.00
            category = "Electrónicos"
            state = "usado"
            location = "FIEC"
            status = "active"
        }
    } | ConvertTo-Json -Depth 3)
    
    $newListing = $response.Content | ConvertFrom-Json
    $listingId = $newListing.listing.id
    
    Write-Host "ID de publicacion creada: $listingId" -ForegroundColor Yellow
    Write-Host $response.Content -ForegroundColor White
    Write-Host "PASO`n" -ForegroundColor Green
} catch {
    Write-Host "FALLO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Respuesta: $($_.ErrorDetails.Message)`n" -ForegroundColor Red
}

# ===================================
# PRUEBA 5: VER DETALLE DE PUBLICACION
# ===================================
Write-Host "PRUEBA 5: Ver Detalle de Publicacion (ID: $listingId)" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $detail = Invoke-WebRequest -Uri "$baseUrl/api/v1/listings/$listingId" -Headers @{
        "Authorization" = "Bearer $token"
    } | Select-Object -Expand Content
    
    Write-Host $detail -ForegroundColor White
    Write-Host "PASO`n" -ForegroundColor Green
} catch {
    Write-Host "FALLO: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ===================================
# PRUEBA 6: EDITAR PUBLICACION
# ===================================
Write-Host "PRUEBA 6: Editar Publicacion (ID: $listingId)" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/listings/$listingId" -Method PUT -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } -Body (@{
        listing = @{
            price = 800.00
            description = "MacBook Pro 13 pulgadas, modelo 2020. REBAJADA! Intel Core i5, 8GB RAM, 256GB SSD. Incluye cargador original y estuche."
        }
    } | ConvertTo-Json -Depth 3)
    
    Write-Host $response.Content -ForegroundColor White
    Write-Host "PASO`n" -ForegroundColor Green
} catch {
    Write-Host "FALLO: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ===================================
# PRUEBA 7: MIS PUBLICACIONES
# ===================================
Write-Host "PRUEBA 7: Ver Mis Publicaciones" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $myListings = Invoke-WebRequest -Uri "$baseUrl/api/v1/listings/my_listings" -Headers @{
        "Authorization" = "Bearer $token"
    } | Select-Object -Expand Content
    
    Write-Host $myListings -ForegroundColor White
    Write-Host "PASO`n" -ForegroundColor Green
} catch {
    Write-Host "FALLO: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ===================================
# PRUEBA 8: PAUSAR/ACTIVAR PUBLICACION
# ===================================
Write-Host "PRUEBA 8: Cambiar Estado de Publicacion (ID: $listingId)" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/listings/$listingId/toggle_status" -Method PATCH -Headers @{
        "Authorization" = "Bearer $token"
    }
    
    Write-Host $response.Content -ForegroundColor White
    Write-Host "PASO`n" -ForegroundColor Green
} catch {
    Write-Host "FALLO: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ===================================
# PRUEBA 9: BUSCAR PUBLICACIONES POR CATEGORIA
# ===================================
Write-Host "PRUEBA 9: Buscar Publicaciones (categoria: Electronicos)" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $search = Invoke-WebRequest -Uri "$baseUrl/api/v1/listings?category=Electrónicos" | Select-Object -Expand Content
    Write-Host $search -ForegroundColor White
    Write-Host "PASO`n" -ForegroundColor Green
} catch {
    Write-Host "FALLO: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ===================================
# PRUEBA 10: ELIMINAR PUBLICACION
# ===================================
Write-Host "PRUEBA 10: Eliminar Publicacion (ID: $listingId)" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/listings/$listingId" -Method DELETE -Headers @{
        "Authorization" = "Bearer $token"
    }
    
    Write-Host $response.Content -ForegroundColor White
    Write-Host "PASO`n" -ForegroundColor Green
} catch {
    Write-Host "FALLO: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ===================================
# RESUMEN
# ===================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan