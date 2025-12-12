"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  birthYear: number | null;
  countryOfOrigin: string | null;
  countryOfResidence: string;
  city: string | null;
  timeZone: string | null;
  currentJobStatus: string | null;
  highestFormalEducationLevel: string | null;
  availability: string | null;
  hoursPerWeek: number | null;
  availableFrom: Date | null;
  expectedSalary: number | null;
  resumeUrl: string | null;
  videoUrl: string | null;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  languages: Array<{
    id: string;
    name: string;
    proficiency: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: string | null;
  }>;
  experiences: Array<{
    id: string;
    company: string | null;
    position: string | null;
    description: string | null;
    startYear: number | null;
    endYear: number | null;
    isCurrent: boolean;
    achievements: string[];
  }>;
  socials: Array<{
    id: string;
    platform: string;
    url: string;
  }>;
}

interface PublicApplicationViewProps {
  application: Application;
}

export function PublicApplicationView({
  application,
}: PublicApplicationViewProps) {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {application.firstName} {application.lastName}
              </CardTitle>
              <CardDescription>{application.email}</CardDescription>
            </div>
            <Badge variant="secondary">{application.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">
                  {application.phoneNumber ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Birth Year</p>
                <p className="font-medium">
                  {application.birthYear ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Country of Origin</p>
                <p className="font-medium">
                  {application.countryOfOrigin ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Country of Residence
                </p>
                <p className="font-medium">{application.countryOfResidence}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">
                  {application.city ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Zone</p>
                <p className="font-medium">
                  {application.timeZone ?? "Not provided"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Professional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Job Status</p>
                <p className="font-medium">
                  {application.currentJobStatus ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Highest Education Level
                </p>
                <p className="font-medium">
                  {application.highestFormalEducationLevel ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Availability</p>
                <p className="font-medium">
                  {application.availability ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours Per Week</p>
                <p className="font-medium">
                  {application.hoursPerWeek ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available From</p>
                <p className="font-medium">
                  {application.availableFrom
                    ? new Date(application.availableFrom).toLocaleDateString()
                    : "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Salary</p>
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
                <h3 className="text-lg font-semibold mb-4">Skills</h3>
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
                <h3 className="text-lg font-semibold mb-4">Languages</h3>
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
                <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
                <div className="space-y-4">
                  {application.experiences.map((exp) => (
                    <div key={exp.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">
                            {exp.position ?? "Position not specified"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {exp.company ?? "Company not specified"}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {exp.startYear}
                          {exp.endYear ? ` - ${exp.endYear}` : exp.isCurrent ? " - Present" : ""}
                        </Badge>
                      </div>
                      {exp.description && (
                        <p className="text-sm mt-2">{exp.description}</p>
                      )}
                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Achievements:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
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
                <h3 className="text-lg font-semibold mb-4">Social Profiles</h3>
                <div className="space-y-2">
                  {application.socials.map((social) => (
                    <div key={social.id} className="flex items-center gap-2">
                      <Badge variant="outline">{social.platform}</Badge>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
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
                <h3 className="text-lg font-semibold mb-4">Files</h3>
                <div className="space-y-2">
                  {application.resumeUrl && (
                    <div>
                      <p className="text-sm text-muted-foreground">Resume</p>
                      <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View Resume
                      </a>
                    </div>
                  )}
                  {application.videoUrl && (
                    <div>
                      <p className="text-sm text-muted-foreground">Video</p>
                      <a
                        href={application.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
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
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
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
        </CardContent>
      </Card>
    </div>
  );
}

