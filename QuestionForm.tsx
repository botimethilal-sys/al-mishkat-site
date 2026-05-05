import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitSubjectQuestion, useSubmitPillarQuestion } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  question: z.string().min(10, "Question must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface QuestionFormProps {
  contextId: string;
  type: "subject" | "pillar";
}

export function QuestionForm({ contextId, type }: QuestionFormProps) {
  const { toast } = useToast();
  const submitSubjectQuestion = useSubmitSubjectQuestion();
  const submitPillarQuestion = useSubmitPillarQuestion();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      question: "",
    },
  });

  const isPending = submitSubjectQuestion.isPending || submitPillarQuestion.isPending;

  function onSubmit(data: FormValues) {
    const payload = {
      data: {
        name: data.name,
        email: data.email || undefined,
        question: data.question,
      }
    };

    const mutation = type === "subject" 
      ? submitSubjectQuestion.mutateAsync({ subjectId: contextId, ...payload })
      : submitPillarQuestion.mutateAsync({ pillarId: contextId, ...payload });

    mutation
      .then(() => {
        toast({
          title: "JazakAllahu Khayran",
          description: "Your question has been submitted successfully.",
        });
        form.reset();
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Submission failed",
          description: "We couldn't submit your question. Please try again.",
        });
      });
  }

  return (
    <div className="bg-card border border-border p-6 md:p-8 rounded-lg shadow-sm">
      <div className="mb-6">
        <h3 className="text-2xl font-serif font-bold text-foreground mb-2">Ask a Question</h3>
        <p className="text-muted-foreground">Submit your questions to our scholars. We will address them in future sessions.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Abdullah" {...field} data-testid="input-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="abdullah@example.com" type="email" {...field} data-testid="input-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Question</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Type your question here..." 
                    className="min-h-[120px] resize-y" 
                    {...field} 
                    data-testid="textarea-question"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending} className="w-full md:w-auto" data-testid="button-submit-question">
            {isPending ? (
              "Submitting..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Question
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
