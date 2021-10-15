//
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
//
// This code is used to create lambda layers and a lambda function to 
// demonstrate conversion of data from AWS Secrets Manager to Lambda 
// Environmental Variables
//
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const secretArn = new cdk.CfnParameter(this, 'secretArn', {
      type: 'String',
      description: 'The ARN for the secret to read data from.'});
    
    const apiTimeout = new cdk.CfnParameter(this, 'apiTimeout', {
      type: 'Number',
      description: 'The amount of time in milliseconds to allow for API execution.',
      default: 5000});

    const secretRegion = cdk.Stack.of(this).region;

    // Create a new policy document
    const lambdaPolicy = new iam.PolicyDocument();
    lambdaPolicy.addStatements(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: [secretArn.valueAsString]
    }));

    // Create the role here to use the secret
    const lambdaRole = new iam.Role(this, 'lambda-layer-example-role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Used to gain access to a Secret stored in SecretManager',
      inlinePolicies: {lambdaPolicy}
    });

    // Create the lambda layer
    const getSecretsLayer = new lambda.LayerVersion(this, 'get-secrets-layer', {
      code: lambda.Code.fromAsset('../out/get-secrets-layer.zip'),
      description: 'This layer is used to pull secrets from secret manager and convert to environmental variables',
      removalPolicy: cdk.RemovalPolicy.DESTROY // NOTE: you wouldn't do this in prod, but it's fine for a dev case
    });

    const secondExampleLayer = new lambda.LayerVersion(this, 'second-example-layer', {
      code: lambda.Code.fromAsset('../out/second-example-layer.zip'),
      description: 'This layer is used for example purposes',
      removalPolicy: cdk.RemovalPolicy.DESTROY // NOTE: you wouldn't do this for prod, but it's fine in this case
    });

    // Create the lambda and assign the role and layer
    const func = new lambda.Function(this, 'example-get-secrets-lambda', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset('../out/example-get-secrets-lambda.zip'),
      layers: [getSecretsLayer, secondExampleLayer],
      role: lambdaRole,
      environment: {
        'AWS_LAMBDA_EXEC_WRAPPER': '/opt/get-secrets-layer',
        'SECRET_REGION': secretRegion,
        'SECRET_ARN': secretArn.valueAsString,
        'API_TIMEOUT': apiTimeout.valueAsString
      }
    });
  }
}
