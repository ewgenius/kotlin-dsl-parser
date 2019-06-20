plugins {
    id("com.android.application")
    id("kotlin-android")
    id("kotlin-android-extensions")
}

android {
    compileSdkVersion(28)
    defaultConfig {
        applicationId = "com.brain.friendly"
        minSdkVersion(16)
        targetSdkVersion(28)
        versionCode = 4
        versionName = "1.2"
        testInstrumentationRunner = "android.support.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
        }
        create("foobar") {
            applicationIdSuffix = ".foobar1"

        }
        getByName("foobar") {
            applicationIdSuffix = ".foobar2"
        }
    }

    flavorDimensions("states")
    productFlavors {
        create("michigan") {
            applicationIdSuffix = ".best"
        }
        create("washington") {
            applicationIdSuffix = ".wa"
        }
        getByName("washington") {
            applicationIdSuffix = ".wa2"
        }
    }
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.3.40")
    implementation("com.android.support:appcompat-v7:28.0.0")
    implementation("com.android.support.constraint:constraint-layout:1.1.3")
    testImplementation("junit:junit:4.12")
    androidTestImplementation("com.android.support.test:runner:1.0.2")
    androidTestImplementation("com.android.support.test.espresso:espresso-core:3.0.2")
    implementation("com.microsoft.appcenter:appcenter-analytics:2.1.0")
    implementation("com.microsoft.appcenter:appcenter-crashes:2.1.0")
    implementation("com.microsoft.appcenter:appcenter-distribute:2.1.0")
}