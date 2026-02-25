import { IconBolt, IconLock, IconMail } from "@tabler/icons-react";
import { Anchor, Flex, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { isEmail, isNotEmpty, useForm } from "@mantine/form";
import { Link, useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/sonner";
import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";

import styles from "./sign-in.module.css";

export function SignInForm() {
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
    <div className={styles.formCard}>
      <Flex align="center" justify="center" direction="column" gap="md" ta="center" mb="lg">
        <Title order={2} fw={600} fz="1.75rem">
          Welcome back
        </Title>
        <Text fz="sm" c="dimmed">
          Sign in to continue your fitness journey
        </Text>
      </Flex>

      <form
        className={styles.form}
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
        <Stack gap="md">
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
            placeholder="Enter your password"
            leftSection={<IconLock size={18} />}
            size="md"
            {...mantineForm.getInputProps("password")}
          />

          <FitAiButton
            variant="primary"
            fullWidth
            type="submit"
            loading={mantineForm.submitting}
            leftSection={mantineForm.submitting ? undefined : <IconBolt size={18} />}
          >
            {mantineForm.submitting ? "Signing in..." : "Sign In"}
          </FitAiButton>
        </Stack>
      </form>

      <Flex justify="center" align="center" c="dimmed" mt="md" fz="sm">
        New to FitAI?
        <Anchor
          fw={600}
          td="none"
          ml="xs"
          c="blue.5"
          renderRoot={(props) => <Link to="/signup" {...props} />}
        >
          Create an account
        </Anchor>
      </Flex>
    </div>
  );
}
