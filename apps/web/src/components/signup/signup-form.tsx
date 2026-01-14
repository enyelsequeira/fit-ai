import { IconLock, IconMail, IconUser } from "@tabler/icons-react";
import { Anchor, Flex, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/sonner";
import { signupDefaultValues, signupSchema } from "./signup.schema";
import styles from "./signup.module.css";

const inputStyles = {
  input: {
    paddingLeft: 42,
  },
};

function SubmitButton({ canSubmit, isSubmitting }: { canSubmit: boolean; isSubmitting: boolean }) {
  return (
    <button type="submit" className={styles.submitButton} disabled={!canSubmit || isSubmitting}>
      {isSubmitting ? (
        <span className={styles.loadingPulse}>
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
        </span>
      ) : (
        "Start Your Journey"
      )}
    </button>
  );
}

export function SignupForm() {
  const navigate = useNavigate({ from: "/signup" });

  const form = useForm({
    defaultValues: signupDefaultValues,
    onSubmit: async ({ value }) => {
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
    },
    validators: {
      onSubmit: signupSchema,
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
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Stack gap="md">
          <form.Field name="name">
            {(field) => (
              <TextInput
                label="Full Name"
                placeholder="John Doe"
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0]?.message}
                leftSection={<IconUser size={18} />}
                size="md"
                styles={inputStyles}
              />
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <TextInput
                label="Email Address"
                placeholder="you@example.com"
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0]?.message}
                leftSection={<IconMail size={18} />}
                size="md"
                styles={inputStyles}
              />
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <>
                <PasswordInput
                  label="Password"
                  placeholder="Create a strong password"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.errors[0]?.message}
                  leftSection={<IconLock size={18} />}
                  size="md"
                  styles={inputStyles}
                />
                {!field.state.meta.errors.length && (
                  <Text className={styles.passwordHint} c="dimmed" size="xs" mt={4}>
                    Must be at least 8 characters
                  </Text>
                )}
              </>
            )}
          </form.Field>

          <form.Subscribe>
            {(state) => (
              <SubmitButton canSubmit={state.canSubmit} isSubmitting={state.isSubmitting} />
            )}
          </form.Subscribe>
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
