plugins {
    id("com.android.application") version "3.0.1"
}

android {
    compileSdkVersion(27)

    defaultConfig {
        applicationId = "net.liutikas.tipandsplit"
        minSdkVersion(16)
        targetSdkVersion(27)
        versionCode = 9
        versionName = "1.9"
        vectorDrawables.useSupportLibrary = true
        resConfigs("en")
    }
    buildTypes {
        getByName("release") {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro")
        }
    }
}

dependencies {
    testCompile("junit:junit:4.12")
    implementation("com.android.support:appcompat-v7:27.0.1")
    implementation(project(":stepperwidget"))
}
