# Flutter

Prefills for the questions a stack can answer on the user's behalf. Everything
here is a starting point the user can edit or delete.

To add a stack, copy this file, change the heading, change the text under each
section, and list it in templates/index.ts. Nothing else.

## what

Flutter and Dart, one codebase for iOS and Android. Riverpod for state,
go_router for navigation, freezed for models.

## commands

flutter pub get
flutter run
flutter test
flutter analyze
dart run build_runner build --delete-conflicting-outputs
flutter build apk --release
flutter build ipa --release

## style

Prefer composition over deep widget trees. Pull anything past three levels into
its own widget.
Const constructors wherever the analyzer allows them.
Dart format decides formatting, so do not argue with it.
One widget per file once a file passes about two hundred lines.
