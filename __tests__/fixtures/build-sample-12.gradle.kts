plugins {
    id("com.android.application")
    id("kotlin-android")
    id("kotlin-android-extensions")
}

android {
    compileSdkVersion(28)
    defaultConfig {
        applicationId = "com.harumin.gradlekotlindslsample"
        minSdkVersion(21)
        targetSdkVersion(28)
        versionCode = 1
        versionName = "1.0"
    }
    buildTypes {

    }
}

dependencies {
    implementation(Dependencies.kotlin)
    implementation(Dependencies.appcompat)
}