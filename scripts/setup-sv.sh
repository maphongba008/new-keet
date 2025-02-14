#!/bin/bash

echo 'run el salvador patch'
git apply scripts/sv/sv.patch

sed -i 's/APP = PRODUCT/APP = SV/' src/lib/build.constants.ts

echo 'copy files'
cp scripts/sv/onboarding_03.png ./src/component/AppModal/ModalComponents/OnBoarding/Icons/onboarding_03.png
cp scripts/sv/onboarding_03@2x.png ./src/component/AppModal/ModalComponents/OnBoarding/Icons/onboarding_03@2x.png
cp scripts/sv/onboarding_03@3x.png ./src/component/AppModal/ModalComponents/OnBoarding/Icons/onboarding_03@3x.png

cp scripts/sv/onboarding_01.svg ./src/resources/onboarding_01.svg
cp scripts/sv/onboarding_02.svg ./src/resources/onboarding_02.svg

# android only
cp scripts/sv/keet_jump.riv android/app/src/main/res/raw/keet_jump.riv

echo 'run normal setup'
