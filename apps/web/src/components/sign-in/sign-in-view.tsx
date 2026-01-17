import { Box, Flex, Loader, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
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

import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/sonner";
import styles from "./sign-in.module.css";
import { Link, useNavigate } from "@tanstack/react-router";
import { isEmail, isNotEmpty, useForm } from "@mantine/form";

function SignInPage() {
  const navigate = useNavigate({ from: "/sign-in" });

  const mantineForm = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: isEmail("Please enter a valid email address"),
      password: isNotEmpty("Please enter a valid password"),
    },
  });

  return (
    <Flex h={"100dvh"}>
      {/* Left side - Form section */}
      <Box className={`${styles.formSection} ${styles.fadeInUp}`}>
        <Box className={styles.formCard}>
          {/* Logo and brand */}
          <Flex direction={"column"} align={"center"} mb={"x"}>
            <Box className={styles.logo}>
              <IconBarbell size={28} color="white" />
            </Box>
            <Text className={styles.brandName}>Fit AI</Text>
          </Flex>

          {/* Form header */}
          <Box ta="center" mb="lg">
            <Title order={2} fw={600} fz={"1.75rem"}>
              Welcome back
            </Title>
            <Text c={"dimmed"} mb={"lg"}>
              Sign in to continue your fitness journey
            </Text>
          </Box>

          {/* Sign in form */}
          <form
            onSubmit={mantineForm.onSubmit(async (e) => {
              await authClient.signIn.email(
                {
                  email: e.email,
                  password: e.password,
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
            })}
          >
            <Stack gap={"md"}>
              <TextInput
                label="Email address"
                placeholder="you@example.com"
                type="email"
                size="md"
                radius="md"
                {...mantineForm.getInputProps("email")}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                size="md"
                radius="md"
                styles={{
                  input: {
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  },
                }}
                {...mantineForm.getInputProps("password")}
              />

              <button
                type="submit"
                className={styles.submitButton}
                style={{
                  width: "100%",
                  borderRadius: "var(--mantine-radius-md)",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {mantineForm.submitting ? (
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
            </Stack>
          </form>

          {/* Sign up link */}
          <Box className={styles.signupSection}>
            <Text size="sm" c={"dimmed"}>
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
          <Text fz={"2.5rem"} fw={700} mb={"md"}>
            Train Smarter.
            <br />
            Get Stronger.
          </Text>

          {/* Subtitle */}
          <Text
            fz={"md"}
            mb={"xl"}
            style={{
              opacity: "0.9",
            }}
          >
            AI-powered workout tracking that adapts to your goals and helps you achieve results
            faster than ever.
          </Text>

          {/* Features list */}
          <Flex direction={"column"} mt={"xl"} ta={"left"} gap={"md"}>
            <Flex align={"center"} gap={"md"} className={styles.featureItem}>
              <Box className={styles.featureIcon}>
                <IconBrain size={20} color="white" />
              </Box>
              <Text>AI-powered workout recommendations</Text>
            </Flex>

            <Flex align={"center"} gap={"md"} className={styles.featureItem}>
              <Box className={styles.featureIcon}>
                <IconChartBar size={20} color="white" />
              </Box>
              <Text>Detailed progress analytics</Text>
            </Flex>

            <Flex align={"center"} gap={"md"} className={styles.featureItem}>
              <Box className={styles.featureIcon}>
                <IconTarget size={20} color="white" />
              </Box>
              <Text>Personalized goal tracking</Text>
            </Flex>

            <Flex align={"center"} gap={"md"} className={styles.featureItem}>
              <Box className={styles.featureIcon}>
                <IconCircleCheck size={20} color="white" />
              </Box>
              <Text>Recovery optimization</Text>
            </Flex>
          </Flex>

          {/* Stats */}
          <Flex justify={"center"} gap={"xl"} mt={"xl"}>
            <Flex align={"center"} direction={"column"}>
              <Text fz={"lg"} fw={700}>
                10k+
              </Text>
              <Text fz={"md"} fw={600}>
                Active Users
              </Text>
            </Flex>
            <Flex align={"center"} direction={"column"}>
              <Text fz={"lg"} fw={700}>
                500k+
              </Text>
              <Text fz={"md"} fw={600}>
                Workouts Logged
              </Text>
            </Flex>
            <Flex align={"center"} direction={"column"}>
              <Text fz={"lg"} fw={700}>
                98%
              </Text>
              <Text fz={"md"} fw={600}>
                Satisfaction
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}

export default SignInPage;
