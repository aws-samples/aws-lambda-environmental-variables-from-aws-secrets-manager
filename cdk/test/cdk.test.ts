//
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
//
// Test code for CDK
//
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Cdk from '../lib/cdk-stack';

// This test will ensure that the necessary constructs are created in the template
test('Lambda Function Created', () => {
  const app = new cdk.App();
    // WHEN
  const stack = new Cdk.CdkStack(app, 'MyTestStack');
    // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::Lambda::Function', {
    "Runtime": "python3.9"
  });
});

// This test will ensure that the necessary constructs are created in the template
test('IAM Permissions Created', () => {
 const app = new cdk.App();
   // WHEN
 const stack = new Cdk.CdkStack(app, 'MyTestStack');
   // THEN
 const template = Template.fromStack(stack);

 template.hasResource('AWS::IAM::Role', {});
});
