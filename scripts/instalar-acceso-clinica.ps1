# Instala en una PC de la clínica el acceso al portal administrativo:
#   - Icono "Pilares de Esperanza - Administración" en el Escritorio.
#   - Arranque automático al iniciar sesión en Windows (carpeta Inicio).
# Abre el portal publicado en Firebase Hosting en una ventana propia (sin barra del navegador).
# No requiere instalar Node, ni abrir cmd, ni dejar ningún servidor encendido: el sistema vive en Internet.
#
# Uso (una sola vez por PC):   powershell -ExecutionPolicy Bypass -File instalar-acceso-clinica.ps1
param(
  [string]$Url = 'https://app-dev-pilares.web.app',
  [switch]$SinArranqueAutomatico
)

$ErrorActionPreference = 'Stop'

$candidatos = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
)
$navegador = $candidatos | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $navegador) { throw 'No se encontró Google Chrome ni Microsoft Edge en esta PC.' }

function Nuevo-Acceso([string]$Carpeta) {
  $ruta = Join-Path $Carpeta 'Pilares de Esperanza - Administracion.lnk'
  $shell = New-Object -ComObject WScript.Shell
  $acceso = $shell.CreateShortcut($ruta)
  $acceso.TargetPath = $navegador
  $acceso.Arguments = "--app=$Url"
  $acceso.WorkingDirectory = Split-Path $navegador
  $acceso.Description = 'Portal administrativo de Pilares de Esperanza'
  $acceso.Save()
  Write-Host "✔ Acceso creado: $ruta"
}

Nuevo-Acceso ([Environment]::GetFolderPath('Desktop'))
if (-not $SinArranqueAutomatico) { Nuevo-Acceso ([Environment]::GetFolderPath('Startup')) }
Write-Host "Listo. El portal se abrirá en $Url"
