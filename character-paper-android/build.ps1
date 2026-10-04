param([string]$JavaHome='C:/Program Files/Java/jdk-21',[string]$SdkTools=(Join-Path $PSScriptRoot '../android-tools'),[string]$Output=(Join-Path $PSScriptRoot '../../outputs/Character-Paper-Android'))
$ErrorActionPreference='Stop'
$java=Join-Path $JavaHome 'bin/java.exe';$javac=Join-Path $JavaHome 'bin/javac.exe';$jar=Join-Path $JavaHome 'bin/jar.exe';$keytool=Join-Path $JavaHome 'bin/keytool.exe'
$tools=Join-Path $SdkTools 'build-tools/android-16';$android=Join-Path $SdkTools 'platforms/android-36/android.jar'
$stage=Join-Path $PSScriptRoot 'build';New-Item -ItemType Directory -Force -Path $stage,$Output,(Join-Path $stage 'classes'),(Join-Path $stage 'dex'),(Join-Path $stage 'assets/www'),(Join-Path $PSScriptRoot 'res/drawable') | Out-Null
$app=Join-Path $PSScriptRoot '../character-paper-desktop/app'
Get-ChildItem $app -File | Where-Object {$_.Extension -in '.js','.css','.html','.svg','.png','.txt'} | ForEach-Object {Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $stage 'assets/www')}
$index=Join-Path $stage 'assets/www/index.html';$html=[IO.File]::ReadAllText($index).Replace('<script src="app.js">','<script src="scrypt.js"></script><script src="local-api.js"></script><script src="android-adapter.js"></script><script src="app.js">').Replace('</body>','<script src="android-ui.js"></script></body>');[IO.File]::WriteAllText($index,$html)
node (Join-Path $PSScriptRoot 'prepare.cjs');if($LASTEXITCODE){throw 'Android JavaScript compilation failed'}
Copy-Item (Join-Path $PSScriptRoot '../character-paper-desktop/build/icon.png') (Join-Path $PSScriptRoot 'res/drawable/icon.png')
& (Join-Path $tools 'aapt2.exe') compile --dir (Join-Path $PSScriptRoot 'res') -o (Join-Path $stage 'res.zip');if($LASTEXITCODE){throw 'Resource compilation failed'}
& (Join-Path $tools 'aapt2.exe') link -o (Join-Path $stage 'unsigned.apk') -I $android --manifest (Join-Path $PSScriptRoot 'AndroidManifest.xml') -A (Join-Path $stage 'assets') (Join-Path $stage 'res.zip');if($LASTEXITCODE){throw 'Resource link failed'}
node (Join-Path $PSScriptRoot 'normalize-zip.cjs') (Join-Path $stage 'unsigned.apk');if($LASTEXITCODE){throw 'APK path normalization failed'}
$sources=Get-ChildItem (Join-Path $PSScriptRoot 'src') -Recurse -Filter '*.java' | ForEach-Object {$_.FullName}
& $javac -source 8 -target 8 -encoding UTF-8 -classpath $android -d (Join-Path $stage 'classes') $sources;if($LASTEXITCODE){throw 'Java compilation failed'}
& $jar cf (Join-Path $stage 'classes.jar') -C (Join-Path $stage 'classes') .
& $java -cp (Join-Path $tools 'lib/d8.jar') com.android.tools.r8.D8 --min-api 26 --lib $android --output (Join-Path $stage 'dex') (Join-Path $stage 'classes.jar');if($LASTEXITCODE){throw 'Dex compilation failed'}
& $jar uf (Join-Path $stage 'unsigned.apk') -C (Join-Path $stage 'dex') classes.dex
& (Join-Path $tools 'zipalign.exe') -f -p 4 (Join-Path $stage 'unsigned.apk') (Join-Path $stage 'aligned.apk');if($LASTEXITCODE){throw 'Alignment failed'}
$debugKey=Join-Path $SdkTools 'local-testing.keystore'
if(!(Test-Path $debugKey)){& $keytool -genkeypair -keystore $debugKey -storepass android -keypass android -alias androiddebugkey -dname 'CN=Android Debug,O=Android,C=US' -keyalg RSA -keysize 2048 -validity 10000;if($LASTEXITCODE){throw 'Debug signing failed'}}
$apk=Join-Path $Output 'Character-Paper-1.0.2-local-test.apk'
& $java -jar (Join-Path $tools 'lib/apksigner.jar') sign --ks $debugKey --ks-pass pass:android --key-pass pass:android --ks-key-alias androiddebugkey --out $apk (Join-Path $stage 'aligned.apk');if($LASTEXITCODE){throw 'APK signing failed'}
& $java -jar (Join-Path $tools 'lib/apksigner.jar') verify --verbose $apk;if($LASTEXITCODE){throw 'APK verification failed'}
$bundletool=Join-Path $SdkTools 'bundletool-all-1.18.3.jar'
if(Test-Path $bundletool){
 & (Join-Path $tools 'aapt2.exe') link --proto-format -o (Join-Path $stage 'proto.apk') -I $android --manifest (Join-Path $PSScriptRoot 'AndroidManifest.xml') -A (Join-Path $stage 'assets') (Join-Path $stage 'res.zip');if($LASTEXITCODE){throw 'Proto link failed'}
 node (Join-Path $PSScriptRoot 'normalize-zip.cjs') (Join-Path $stage 'proto.apk');if($LASTEXITCODE){throw 'Bundle path normalization failed'}
 $module=Join-Path $stage 'module';New-Item -ItemType Directory -Force -Path $module,(Join-Path $module 'manifest'),(Join-Path $module 'dex') | Out-Null
 Push-Location $module;try{& $jar xf (Join-Path $stage 'proto.apk')}finally{Pop-Location}
 Move-Item (Join-Path $module 'AndroidManifest.xml') (Join-Path $module 'manifest/AndroidManifest.xml') -Force
 Copy-Item (Join-Path $stage 'dex/classes.dex') (Join-Path $module 'dex/classes.dex')
 & $jar cMf (Join-Path $stage 'base.zip') -C $module .
 $bundle=Join-Path $Output 'Character-Paper-1.0.2-unsigned.aab';if(Test-Path $bundle){Remove-Item -LiteralPath $bundle}
 $baseZip=Join-Path $stage 'base.zip'
 & $java -jar $bundletool build-bundle "--modules=$baseZip" "--output=$bundle";if($LASTEXITCODE){throw 'Bundle creation failed'}
 & $java -jar $bundletool validate --bundle=$bundle;if($LASTEXITCODE){throw 'Bundle validation failed'}
}
Write-Output "APK: $apk"
