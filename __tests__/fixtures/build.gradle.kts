plugins {
  id("com.android.application")
  kotlin("android")
  kotlin("android.extensions")
}

android {
  compileSdkVersion(28)
  defaultConfig {
    applicationId = "sk.android.com.kotlindsl"
    minSdkVersion(15)
    targetSdkVersion(28)
    versionCode = 1
    versionName = "1.0"
    testInstrumentationRunner = "android.support.test.runner.AndroidJUnitRunner"
  }
  buildTypes {
    val booleanType = "Boolean"
    getByName ("debug") {
      buildConfigField(booleanType, Config.BuildFurniture.ENABLE_ROTATION, false.toString())
      isDebuggable = true
    }
    create("qa") {
      buildConfigField(booleanType, Config.BuildFurniture.ENABLE_ROTATION, true.toString())
      isShrinkResources = true
      isMinifyEnabled = true
      isUseProguard = true
      proguardFiles(getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro")
    }

    getByName("release") {
      buildConfigField(booleanType, Config.BuildFurniture.ENABLE_ROTATION, true.toString())
      isShrinkResources = true
      isMinifyEnabled = true
      isUseProguard = true
      proguardFiles(getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro")
    }
  }

  productFlavors {
    create("free") {
      applicationId = "sk.android.free"
    }
    create("paid") {
      applicationId = "sk.android.paid"
    }
  }
}

dependencies {
  implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.jar"))))
  implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.2.61")
  implementation("androidx.appcompat:appcompat:1.0.0-rc02")
  implementation("androidx.constraintlayout:constraintlayout:2.0.0-alpha2")
  testImplementation("junit:junit:4.12")
  androidTestImplementation("androidx.test:runner:1.1.0-alpha4")
  androidTestImplementation("androidx.test.espresso:espresso-core:3.1.0-alpha4")
}