import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";

import { GatsbySite } from "@dangreaves/gatsby-adapter-aws/cdk.js";

export interface GatsbyStackProps extends cdk.StackProps {
  vpc?: ec2.IVpc;
  gatsbyDir: string;
  ssr?: "DISABLED" | "LAMBDA" | "FARGATE";
}

export class GatsbyStack extends cdk.Stack {
  constructor(
    scope: cdk.App,
    id: string,
    { vpc, ssr = "LAMBDA", gatsbyDir, ...props }: GatsbyStackProps,
  ) {
    super(scope, id, props);

    // Throw exception if FARGATE target selected, but no VPC provided.
    if ("FARGATE" === ssr && !vpc) {
      throw new Error("Cannot create ECS cluster without a VPC.");
    }

    // Create ECS cluster if needed.
    const cluster =
      "FARGATE" === ssr ? new ecs.Cluster(this, "Cluster", { vpc }) : undefined;

    // Create the Gatsby site.
    new GatsbySite(this, "GatsbySite", {
      cluster,
      gatsbyDir,
      ssrOptions: ssr ? { target: ssr } : undefined,
    });
  }
}
