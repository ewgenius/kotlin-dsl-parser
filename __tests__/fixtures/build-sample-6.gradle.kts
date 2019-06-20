import ie.otormaigh.pluto.toolbox.Deps
import ie.otormaigh.pluto.toolbox.BuildConfig

plugins {
  id("com.android.library")
  id("kotlin-android")
}

android {
  compileSdkVersion(BuildConfig.compileSdk)
  defaultConfig {
    minSdkVersion(BuildConfig.minSdk)
    targetSdkVersion(BuildConfig.targetSdk)
    versionCode = 1
    versionName = "0.1"

    setConsumerProguardFiles(listOf("proguard-rules.pro"))
  }

  buildTypes {
    named("release").configure {
    }
  }
}

dependencies {
  implementation(Deps.Library.kotlin.stdlib)
  implementation(Deps.Library.androidx.appcompat)
}