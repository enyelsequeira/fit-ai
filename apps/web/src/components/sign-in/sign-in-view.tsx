import { Box, Center, Loader, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import {
  IconActivity,
  IconChartBar,
  IconBrain,
  IconCircleCheck,
  IconBarbell,
  IconFlame,
  IconTarget,
  IconTrendingUp,
  IconBolt,
} from "@tabler/icons-react";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/sonner";
import styles from "./sign-in.module.css";
import { Link, useNavigate } from "@tanstack/react-router";

function SignInPage() {
  const navigate = useNavigate({ from: "/sign-in" });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({ to: "/dashboard" });
            toast.success("Welcome back! Let's crush your goals.");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return (
      <Box className={styles.loaderOverlay}>
        <Center>
          <Stack align="center" gap="md">
            <Box className={styles.logo}>
              <IconBarbell size={28} color="white" />
            </Box>
            <Loader size="md" color="grape" />
          </Stack>
        </Center>
      </Box>
    );
  }

  return (
    <Box className={styles.container}>
      {/* Left side - Form section */}
      <Box className={`${styles.formSection} ${styles.fadeInUp}`}>
        <Box className={styles.formCard}>
          {/* Logo and brand */}
          <Box className={styles.logoSection}>
            <Box className={styles.logo}>
              <IconBarbell size={28} color="white" />
            </Box>
            <Text className={styles.brandName}>Fit AI</Text>
          </Box>

          {/* Form header */}
          <Box ta="center" mb="lg">
            <Title order={2} className={styles.formTitle}>
              Welcome back
            </Title>
            <Text className={styles.formSubtitle}>Sign in to continue your fitness journey</Text>
          </Box>

          {/* Sign in form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <Stack gap={0}>
              <form.Field name="email">
                {(field) => (
                  <Box className={styles.inputWrapper}>
                    <TextInput
                      label="Email address"
                      placeholder="you@example.com"
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={field.state.meta.errors[0]?.message}
                      size="md"
                      radius="md"
                      styles={{
                        input: {
                          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                        },
                      }}
                    />
                  </Box>
                )}
              </form.Field>

              <form.Field name="password">
                {(field) => (
                  <Box className={styles.inputWrapper}>
                    <PasswordInput
                      label="Password"
                      placeholder="Enter your password"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={field.state.meta.errors[0]?.message}
                      size="md"
                      radius="md"
                      styles={{
                        input: {
                          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                        },
                      }}
                    />
                  </Box>
                )}
              </form.Field>

              <form.Subscribe>
                {(state) => (
                  <button
                    type="submit"
                    disabled={!state.canSubmit || state.isSubmitting}
                    className={styles.submitButton}
                    style={{
                      width: "100%",
                      borderRadius: "var(--mantine-radius-md)",
                      cursor: state.canSubmit && !state.isSubmitting ? "pointer" : "not-allowed",
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {state.isSubmitting ? (
                      <>
                        <Loader size="xs" color="white" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <IconBolt size={18} />
                        Sign In
                      </>
                    )}
                  </button>
                )}
              </form.Subscribe>
            </Stack>
          </form>

          {/* Sign up link */}
          <Box className={styles.signupSection}>
            <Text size="sm" className={styles.signupText}>
              New to Fit AI?{" "}
              <Link to="/signup" className={styles.signupLink}>
                Create an account
              </Link>
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Right side - Visual section */}
      <Box className={styles.visualSection}>
        {/* Gradient background */}
        <Box className={styles.visualBackground} />

        {/* Animated blobs */}
        <Box className={`${styles.blob} ${styles.blob1}`} />
        <Box className={`${styles.blob} ${styles.blob2}`} />
        <Box className={`${styles.blob} ${styles.blob3}`} />

        {/* Grid pattern */}
        <Box className={styles.gridPattern} />

        {/* Content */}
        <Box className={`${styles.visualContent} ${styles.fadeInRight}`}>
          {/* Floating icons */}
          <Box className={styles.floatingIcons}>
            <Box className={styles.iconWrapper}>
              <IconActivity size={28} color="white" />
            </Box>
            <Box className={styles.iconWrapper}>
              <IconFlame size={32} color="white" />
            </Box>
            <Box className={styles.iconWrapper}>
              <IconTrendingUp size={28} color="white" />
            </Box>
          </Box>

          {/* Title */}
          <Text className={styles.visualTitle}>
            Train Smarter.
            <br />
            Get Stronger.
          </Text>

          {/* Subtitle */}
          <Text className={styles.visualSubtitle}>
            AI-powered workout tracking that adapts to your goals and helps you achieve results
            faster than ever.
          </Text>

          {/* Features list */}
          <Box className={styles.featuresList}>
            <Box className={styles.featureItem}>
              <Box className={styles.featureIcon}>
                <IconBrain size={20} color="white" />
              </Box>
              <Text className={styles.featureText}>AI-powered workout recommendations</Text>
            </Box>

            <Box className={styles.featureItem}>
              <Box className={styles.featureIcon}>
                <IconChartBar size={20} color="white" />
              </Box>
              <Text className={styles.featureText}>Detailed progress analytics</Text>
            </Box>

            <Box className={styles.featureItem}>
              <Box className={styles.featureIcon}>
                <IconTarget size={20} color="white" />
              </Box>
              <Text className={styles.featureText}>Personalized goal tracking</Text>
            </Box>

            <Box className={styles.featureItem}>
              <Box className={styles.featureIcon}>
                <IconCircleCheck size={20} color="white" />
              </Box>
              <Text className={styles.featureText}>Recovery optimization</Text>
            </Box>
          </Box>

          {/* Stats */}
          <Box className={styles.statsRow}>
            <Box className={styles.statItem}>
              <Text className={styles.statNumber}>10k+</Text>
              <Text className={styles.statLabel}>Active Users</Text>
            </Box>
            <Box className={styles.statItem}>
              <Text className={styles.statNumber}>500k+</Text>
              <Text className={styles.statLabel}>Workouts Logged</Text>
            </Box>
            <Box className={styles.statItem}>
              <Text className={styles.statNumber}>98%</Text>
              <Text className={styles.statLabel}>Satisfaction</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default SignInPage;
