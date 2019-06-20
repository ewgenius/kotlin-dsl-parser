plugins {
    id(Plugins.androidApplication)
    kotlin(Plugins.kotlinAndroid)
    kotlin(Plugins.kotlinExtensions)
    kotlin(Plugins.kapt)
}

/*androidExtensions {
    configure(delegateClosureOf<AndroidExtensionsExtension> {
        isExperimental = true
    })
}*/

android {
    compileSdkVersion(Configs.compileSdkVersion)
    defaultConfig {
        applicationId = Configs.applicationId
        minSdkVersion(Configs.minSdkVersion)
        targetSdkVersion(Configs.targetSdkVersion)
        versionCode = Configs.versionCode
        versionName = Configs.versionName
        dataBinding.isEnabled = true
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), file("proguard-rules.pro"))
        }
    }

    buildTypes {
        buildTypes.forEach {
            val string = "String"
            val baseUrl = "BASE_URL"

            it.buildConfigField(string, baseUrl, project.properties[baseUrl].toString())
        }
    }
}

dependencies {
    implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.jar"))))
    implementation(Libraries.Androidx.coreKtx)
    implementation(Libraries.Androidx.constraintLayout)
    implementation(Libraries.Koin.viewmodel)
    implementation(Libraries.Kotlin.stdlib)
    implementation(Libraries.Kotlin.sdp)
    implementation(Libraries.Kotlin.coroutinesAndroid)
    implementation(Libraries.Retrofit.retrofit)
    implementation(Libraries.Retrofit.coroutineAdapter)
    implementation(Libraries.Retrofit.gsonConverter)
    implementation(Libraries.Androidx.appcompat)
    implementation(Libraries.Android.design)
    implementation(Libraries.Room.runtimeRoom)
    implementation(Libraries.Room.rxJavaForRoom)
    implementation(Libraries.glide)
    implementation(Arch.Lifecycle.extensions)
    testImplementation(Libraries.Tests.junit)
    androidTestImplementation(Libraries.AndroidTests.testRunner)
    androidTestImplementation(Libraries.AndroidTests.espressoCore)

    kapt(Libraries.glideProcessor)
    kapt(Libraries.Room.compiler)
}
