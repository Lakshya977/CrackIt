"use client";

import React from "react";
import { Form, Input, Select, SelectItem, Button } from "@heroui/react";
import {
  industryTopics,
  interviewDifficulties,
  interviewTypes,
} from "@/Constants/data";
import { useGenericSubmitHandler } from "../form/genericSubmitHandler";
import { InterviewBody } from "@/backend/types/interview.types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IUser } from "@/backend/models/user.model";
import toast from "react-hot-toast";
import { newInterview } from "@/actions/interview.action";

const interviewIndustries = Object.keys(industryTopics);

export default function NewInterview() {
  const [selectedIndustry, setSelectedIndustry] = React.useState("");
  const [topics, setTopics] = React.useState<string[]>([]);

  const { data: session, status } = useSession();
  const user = session?.user as IUser | undefined;
  const router = useRouter();

  // Redirect if unauthenticated
  React.useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Please log in to create an interview");
      router.push("/login");
    }
  }, [status, router]);

  // Debug user ID
  React.useEffect(() => {
    console.log("Session status:", status);
    console.log("Session user:", session?.user);
    console.log("User ID:", user?._id || (session?.user as any)?.id);
  }, [session, status, user]);

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const industry = e.target.value as keyof typeof industryTopics;
    setSelectedIndustry(industry);
    setTopics(industryTopics[industry] || []);
  };

  const { handleSubmit, loading } = useGenericSubmitHandler(async (data) => {
    if (!user || !user._id) {
      toast.error("User not authenticated or ID missing");
      router.push("/login");
      return;
    }

    const userId = user._id || (user as any).id;
    console.log("Sending userId:", userId);

    const interviewData: InterviewBody = {
      industry: data.industry,
      topic: data.topic,
      type: data.type,
      role: data.role,
      difficulty: data.difficulty,
      numOfQuestions: Number(data.numOfQuestions),
      duration: Number(data.duration),
      user: userId,
    };

    const res = await newInterview(interviewData);

    if (res?.error) {
      return toast.error(res?.error?.message);
    }

    if (res?.created) {
      toast.success("Interview created successfully");
      router.push("/app/interviews");
    }
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="p-4">
      <Form validationBehavior="native" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="col-span-1">
            <h3 className="text-xl">Select all options below:</h3>
          </div>
          <div className="col-span-1">
            <div className="flex gap-4 max-w-sm justify-end items-center">
              <Button
                color="primary"
                type="submit"
                isLoading={loading}
                isDisabled={loading}
              >
                Create Interview
              </Button>
              <Button type="reset" variant="bordered">
                Reset
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16 w-full">
          <div className="col-span-1">
            <div className=" BW-full flex flex-col space-y-4">
              <div className="flex flex-col gap-4 w-full max-w-sm">
                <Select
                  isRequired
                  label="Industry"
                  labelPlacement="outside"
                  name="industry"
                  placeholder="Select Industry"
                  onChange={handleIndustryChange}
                >
                  {interviewIndustries?.map((industry) => (
                    <SelectItem key={industry} >
                      {industry}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  isRequired
                  label="Topic"
                  labelPlacement="outside"
                  name="topic"
                  placeholder="Select Topic"
                  disabled={!selectedIndustry}
                >
                  {topics?.map((topic) => (
                    <SelectItem key={topic} >
                      {topic}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  isRequired
                  label="Interview Type"
                  labelPlacement="outside"
                  name="type"
                  placeholder="Select interview type"
                >
                  {interviewTypes?.map((type) => (
                    <SelectItem key={type} >
                      {type}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  isRequired
                  type="text"
                  label="Job Role"
                  labelPlacement="outside"
                  name="role"
                  placeholder="software developer, data scientist, etc."
                />
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <div className="w-full flex flex-col space-y-4">
              <div className="flex flex-col gap-4 w-full max-w-sm">
                <Select
                  isRequired
                  label="Difficulty"
                  labelPlacement="outside"
                  name="difficulty"
                  placeholder="Select difficulty"
                >
                  {interviewDifficulties?.map((difficulty) => (
                    <SelectItem key={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  isRequired
                  type="number"
                  label="No of Questions"
                  labelPlacement="outside"
                  name="numOfQuestions"
                  placeholder="Enter no of questions"
                />
                <Input
                  isRequired
                  type="number"
                  label="Duration"
                  labelPlacement="outside"
                  name="duration"
                  placeholder="Enter duration"
                />
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}