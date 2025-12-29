# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure Supabase environment variables. Create an `.env` file (or use another mechanism
   supported by Expo) that contains your project details:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:55431
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   SUPABASE_SECRET_KEY=your-secret-service-key
   ```

   Use the publishable key in the Expo app (see `lib/supabase.ts`) and reserve the secret key for
   server/admin scripts (see `lib/supabase-admin.ts`). They must match the Supabase project that runs
   locally via `supabase start`.

3. Run the Supabase migrations and seed data so the demo user exists:

   ```bash
   supabase db reset
   ```

4. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Login

- At launch the app shows a login screen. Sign in with any existing Supabase user. The included
  seed (`supabase/seed.sql`) creates `demo@checklist.supabase.test` with the password `Passw0rd!`.
- Account creation happens in Supabase Studio or via seeds; the app itself only supports login and
  logout.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
