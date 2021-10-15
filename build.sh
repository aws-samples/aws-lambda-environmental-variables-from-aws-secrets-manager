#!/bin/sh

#
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
#
# This script is used to build and deploy this example and should be executed from 
# a Amazon Linux 2 compatible system.  For ease of deployment, AWS Cloud 9 is the 
# best choice.
#

SECRET_ARN=$1

# Make sure that a secret arn was supplied as an argument
if [[ -z ${SECRET_ARN+z} ]]; then
    echo "Build failed as no SECRET ARN was supplied as the only argument to this script"
	exit 1
fi

# Remove the output directory if it exists as it may container artifacts from a previous build
rm -rf ./out
mkdir out

# Copy all of the necessary code into the build directory
cp -r ./src ./out
cp -r ./test ./out

# First complile the go code
cd ./out/src
go build

# Make sure that the shell script is executable
chmod +x get-secrets-layer

# Create a zip of the dir
zip get-secrets-layer.zip get-secrets-layer go-retrieve-secret
mv ./get-secrets-layer.zip ..

# Create a zip of the example python function
cd ../test
zip example-get-secrets-lambda.zip *.py
mv example-get-secrets-lambda.zip ..
zip second-example-layer.zip second-example-layer
mv second-example-layer.zip ..
cd ../..

# Now run the CDK to deploy everything
cd cdk
cdk deploy --parameters secretArn="${SECRET_ARN}"