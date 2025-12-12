"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Copy, ExternalLink } from "lucide-react";
import { PublicLinkToggle } from "./public-link-toggle";
import { toast } from "sonner";

interface ApplicationDetailProps {
  applicationId: string;
  onBack: () => void;
}

export function ApplicationDetail({
  applicationId,
  onBack,
}: ApplicationDetailProps) {
  const {
    data: application,
    isLoading,
    refetch,
  } = api.admin.getApplication.useQuery({ id: applicationId });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-muted-foreground py-8 text-center">
          Loading application details...
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-muted-foreground py-8 text-center">
          Application not found
        </div>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>
    );
  }

  const shareableUrl =
    application.isPublic && application.publicToken
      ? `${window.location.origin}/application/${application.publicToken}`
      : null;

  const copyLink = () => {
    if (shareableUrl) {
      void navigator.clipboard.writeText(shareableUrl);
      toast.success("Shareable link copied to clipboard");
    }
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <div className="flex items-center gap-4">
          <PublicLinkToggle
            applicationId={applicationId}
            isPublic={application.isPublic}
            onToggle={refetch}
          />
          {shareableUrl && (
            <Button variant="outline" onClick={copyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          )}
          {shareableUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(shareableUrl, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Public
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {application.firstName} {application.lastName}
              </CardTitle>
              <CardDescription>{application.email}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{application.category}</Badge>
              <Badge
                variant={
                  application.status === "active" ? "default" : "secondary"
                }
              >
                {application.status ?? "active"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Phone</p>
                <p className="font-medium">
                  {application.phoneNumber ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Birth Year</p>
                <p className="font-medium">
                  {application.birthYear ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  Country of Origin
                </p>
                <p className="font-medium">
                  {application.countryOfOrigin ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  Country of Residence
                </p>
                <p className="font-medium">{application.countryOfResidence}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">City</p>
                <p className="font-medium">
                  {application.city ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Time Zone</p>
                <p className="font-medium">
                  {application.timeZone ?? "Not provided"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Professional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">
                  Current Job Status
                </p>
                <p className="font-medium">
                  {application.currentJobStatus ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  Highest Education Level
                </p>
                <p className="font-medium">
                  {application.highestFormalEducationLevel ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Availability</p>
                <p className="font-medium">
                  {application.availability ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Hours Per Week</p>
                <p className="font-medium">
                  {application.hoursPerWeek ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Available From</p>
                <p className="font-medium">
                  {application.availableFrom
                    ? new Date(application.availableFrom).toLocaleDateString()
                    : "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Expected Salary</p>
                <p className="font-medium">
                  {application.expectedSalary
                    ? `$${application.expectedSalary.toLocaleString()} USD`
                    : "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          {application.skills && application.skills.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="mb-4 text-lg font-semibold">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {application.skills.map((skill) => (
                    <Badge key={skill.id} variant="outline">
                      {skill.name}
                      {skill.level && ` (${skill.level})`}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Languages */}
          {application.languages && application.languages.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="mb-4 text-lg font-semibold">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {application.languages.map((lang) => (
                    <Badge key={lang.id} variant="outline">
                      {lang.name} ({lang.proficiency})
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Work Experience */}
          {application.experiences && application.experiences.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="mb-4 text-lg font-semibold">Work Experience</h3>
                <div className="space-y-4">
                  {application.experiences.map((exp) => (
                    <div key={exp.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="font-semibold">
                            {exp.position ?? "Position not specified"}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {exp.company ?? "Company not specified"}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {exp.startYear}
                          {exp.endYear
                            ? ` - ${exp.endYear}`
                            : exp.isCurrent
                              ? " - Present"
                              : ""}
                        </Badge>
                      </div>
                      {exp.description && (
                        <p className="mt-2 text-sm">{exp.description}</p>
                      )}
                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Achievements:</p>
                          <ul className="text-muted-foreground list-inside list-disc text-sm">
                            {exp.achievements.map((achievement, idx) => (
                              <li key={idx}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Social Profiles */}
          {application.socials && application.socials.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="mb-4 text-lg font-semibold">Social Profiles</h3>
                <div className="space-y-2">
                  {application.socials.map((social) => (
                    <div key={social.id} className="flex items-center gap-2">
                      <Badge variant="outline">{social.platform}</Badge>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline"
                      >
                        {social.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Files */}
          {(application.resumeUrl ?? application.videoUrl) && (
            <>
              <Separator />
              <div>
                <h3 className="mb-4 text-lg font-semibold">Files</h3>
                <div className="space-y-2">
                  {application.resumeUrl && (
                    <div>
                      <p className="text-muted-foreground text-sm">Resume</p>
                      <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline"
                      >
                        View Resume
                      </a>
                    </div>
                  )}
                  {application.videoUrl && (
                    <div>
                      <p className="text-muted-foreground text-sm">Video</p>
                      <a
                        href={application.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline"
                      >
                        View Video
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Tags */}
          {application.tags && application.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="mb-4 text-lg font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {application.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {application.notes && (
            <>
              <Separator />
              <div>
                <h3 className="mb-4 text-lg font-semibold">Notes</h3>
                <p className="text-sm whitespace-pre-wrap">
                  {application.notes}
                </p>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div>
            <h3 className="mb-4 text-lg font-semibold">Metadata</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Updated At</p>
                <p className="font-medium">
                  {new Date(application.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
