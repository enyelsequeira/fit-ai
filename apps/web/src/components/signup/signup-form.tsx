import { IconLock, IconMail, IconUser } from "@tabler/icons-react";
import { Anchor, Flex, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { Link, useNavigate } from "@tanstack/react-router";

import styles from "./signup.module.css";
import { isEmail, isNotEmpty, useForm } from "@mantine/form";
import { authClient } from "@/lib/auth-client.ts";
import { toast } from "@/components/ui/sonner.tsx";

export function SignupForm() {
  const navigate = useNavigate({ from: "/signup" });
  const mantineForm = useForm({
    initialValues: {
      email: "",
      password: "",
      name: "",
    },
    validate: {
      email: isEmail("Please enter a valid email"),
      password: isNotEmpty("Please enter a valid password"),
      name: isNotEmpty("Please enter a name"),
    },
  });

  return (
    <div className={styles.formCard}>
      <Flex align="center" justify="center" direction="column" gap="md" ta="center" mb="lg">
        <Title order={2} fw={600} fz="1.75rem">
          Create your account
        </Title>
        <Text fz="sm" c="dimmed">
          Start your fitness transformation today
        </Text>
      </Flex>

      <form
        className={styles.form}
        onSubmit={mantineForm.onSubmit(async (value) => {
          await authClient.signUp.email(
            {
              email: value.email,
              password: value.password,
              name: value.name,
            },
            {
              onSuccess: () => {
                navigate({ to: "/dashboard" });
                toast.success("Welcome to FitAI! Your fitness journey begins now.");
              },
              onError: (error) => {
                toast.error(error.error.message || error.error.statusText);
              },
            },
          );
        })}
      >
        <Stack gap="md">
          <TextInput
            label="Full Name"
            placeholder="John Doe"
            leftSection={<IconUser size={18} />}
            size="md"
            {...mantineForm.getInputProps("name")}
          />
          <TextInput
            label="Email Address"
            placeholder="you@example.com"
            type="email"
            leftSection={<IconMail size={18} />}
            size="md"
            {...mantineForm.getInputProps("email")}
          />
          <PasswordInput
            label="Password"
            placeholder="Create a strong password"
            leftSection={<IconLock size={18} />}
            size="md"
            {...mantineForm.getInputProps("password")}
          />
          <button type="submit" className={styles.submitButton}>
            {mantineForm.submitting ? (
              <span className={styles.loadingPulse}>
                <span className={styles.loadingDot} />
                <span className={styles.loadingDot} />
                <span className={styles.loadingDot} />
              </span>
            ) : (
              "Start Your Journey"
            )}
          </button>
        </Stack>
      </form>

      <Flex justify="center" align="center" c="dimmed" mt="md" fz="sm">
        Already have an account?
        <Anchor
          fw={600}
          td="none"
          ml="xs"
          c="blue.5"
          renderRoot={(props) => <Link to="/sign-in" {...props} />}
        >
          Sign in
        </Anchor>
      </Flex>
    </div>
  );
}
