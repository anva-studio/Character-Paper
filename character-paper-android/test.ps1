param([string]$Emulator='emulator-5554',[string]$JavaHome='C:/Program Files/Java/jdk-21',[string]$SdkTools=(Join-Path $PSScriptRoot '../android-tools'))
$ErrorActionPreference='Stop';$java=Join-Path $JavaHome 'bin/java.exe';$javac=Join-Path $JavaHome 'bin/javac.exe';$jar=Join-Path $JavaHome 'bin/jar.exe';$tools=Join-Path $SdkTools 'build-tools/android-16';$android=Join-Path $SdkTools 'platforms/android-36/android.jar';$stage=Join-Path $PSScriptRoot 'tests/build';New-Item -ItemType Directory -Force -Path $stage,(Join-Path $stage 'classes'),(Join-Path $stage 'dex') | Out-Null
& (Join-Path $tools 'aapt2.exe') link -o (Join-Path $stage 'unsigned.apk') -I $android --manifest (Join-Path $PSScriptRoot 'tests/AndroidManifest.xml');if($LASTEXITCODE){throw 'Test resource link failed'}
& $javac -source 8 -target 8 -encoding UTF-8 -classpath $android -d (Join-Path $stage 'classes') (Get-ChildItem (Join-Path $PSScriptRoot 'tests/src') -Recurse -Filter '*.java' | ForEach-Object {$_.FullName});if($LASTEXITCODE){throw 'Test compilation failed'}
& $jar cf (Join-Path $stage 'classes.jar') -C (Join-Path $stage 'classes') .
& $java -cp (Join-Path $tools 'lib/d8.jar') com.android.tools.r8.D8 --min-api 26 --lib $android --output (Join-Path $stage 'dex') (Join-Path $stage 'classes.jar');if($LASTEXITCODE){throw 'Test dex failed'}
& $jar uf (Join-Path $stage 'unsigned.apk') -C (Join-Path $stage 'dex') classes.dex
& (Join-Path $tools 'zipalign.exe') -f 4 (Join-Path $stage 'unsigned.apk') (Join-Path $stage 'aligned.apk')
$testApk=Join-Path $stage 'checks.apk'
& $java -jar (Join-Path $tools 'lib/apksigner.jar') sign --ks (Join-Path $SdkTools 'local-testing.keystore') --ks-pass pass:android --key-pass pass:android --ks-key-alias androiddebugkey --out $testApk (Join-Path $stage 'aligned.apk');if($LASTEXITCODE){throw 'Test signing failed'}
$adb=Join-Path $SdkTools 'platform-tools/adb.exe'
& $adb -s $Emulator install -r (Join-Path $PSScriptRoot '../../outputs/Character-Paper-Android/Character-Paper-1.0.2-local-test.apk');if($LASTEXITCODE){throw 'App installation failed'}
& $adb -s $Emulator install -r $testApk;if($LASTEXITCODE){throw 'Test installation failed'}
$result=& $adb -s $Emulator shell am instrument -w studio.anva.characterpaper.tests/.ReleaseChecks
$result
if(($result -join "`n") -notmatch 'result=PASS:'){throw 'Android instrumentation did not pass'}
