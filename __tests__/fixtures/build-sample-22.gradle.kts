plugins {
    id("com.android.application")
}

android {
    compileSdkVersion(28)
    buildTypes {
        getByName("release") {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro")
        }
        getByName("release") {
            // should not find two
        }
    }

    flavorDimensions("release")

    productFlavors {
        // create("test") {

        // }
         create("live") {
             setDimension("release")
         }
         /*
            create("testtest")
            why should I be here, I'm just a comment
          */
         create("internal") {
             setDimension("release")
             signingConfig = signingConfigs.getByName("internalConfig")
         }

         getByName("i_dont_exist_why_find_me") {

         }
    }
}

productFlavors {
    create("should_not_find_me_outside_android")
}

dependencies {
/*
    productFlavors {
        create("should_not_find_me")
    }
*/
    implementation("com.android.support:appcompat-v7:28.0.0")
    implementation("com.android.support.constraint:constraint-layout:1.1.3")
    implementation("com.android.support.constraint:constraint-layout-solver:1.1.3")
}