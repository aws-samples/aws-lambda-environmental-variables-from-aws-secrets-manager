# Lambda Extension Secrets via Layer

The purpose of this project is to create an AWS Lambda Layer that can read values from Secrets Manager and create Lambda Envrionmental variables from the data.  By using this layer, this allows for the Lambda to remain unchanged while the Secret values do change.  

This approach is needed in cases where 3rd party layers are used to monitor or instrument a Lambda Function, but you need to have centralized control over Secret values but need the data to be provided as Environmental variables to a Lambda.

This project assumes requires that you supply an ARN for a secret in order to create the necessary permissions for accessing the secret.

## Usage

In order to build this project, use the ``build.sh`` shell script.  This script assumes that you have the latest version of ``Golang`` and ``CDK`` installed and that you have an ``ARN`` for a Secret that contains the values you want created into envrionmental variables.

To create a build and to deploy it to your AWS account, execute the following command:
    ```sh
    ./build.sh <ARN of the SECRET to use>
    ```
If you want to do the steps manually, perform the following steps on a Amazon Linux 2 AMI system:
1. Compile the golang code using the following command:
    ```sh
    go build
    ```
1. Ensure that the shell script ``get-secrets-layer`` is executable:
    ```sh
    chmod +x get-secrets-layer
    ```
1. Create a ZIP that includes the ``get-secrets-layer`` and ``go-retrieve-secret`` files:
    ```sh
    zip get-secrets-layer.zip get-secrets-layer go-retrieve-secret
    ```
1. Create a new Lambda Layer using the created ZIP
1. Attach the layer to your target Lambda
1. Set the necessary environmental variables so that the layer will be able to find and retrieve the Secret, including ``AWS_LAMBDA_EXEC_WRAPPER``, ``SECRET_NAME``, ``SECRET_REGION``, and ``ASSUME_ROLE_ARN``
    1. ``AWS_LAMBDA_EXEC_WRAPPER`` should be ``/opt/get-secrets-layer`` - this is used to ensure that the Lambda Layer is executed
    1. ``SECRET_NAME`` - this is the name of the Secret to use, this envrionmental variable is required
    1. ``SECRET_REGION`` - this is the region where the Secret exists, this envrionmental variable is required
    1. ``ASSUME_ROLE_ARN`` - This is the optional ARN for the role to assume to retrieve the Secret.  The purpose for this role is to allow for the case where you don't want the Lambda to directly have permissions to read and decrypt a Secret.  Please note, you will have to ensure that the role the Lambda is using has the ability to assume this role.
1. Ensure that the Secret is a Secure String and is in ``JSON`` format, for example:
    ```json
    {
        "TEST_DATA": "SECURE VALUE",
        "AUTH_DATA": "SECURE VALUE"
    }
    ```
``NOTE:`` You can chain the layers by setting a key / value in the secret that points to the next layer.  In this project there is an example second layer that is created and deployed.  In order to verify that this second layer is executed and able to add to the environment, make sure that the secret contains the following key / value pair:
    ```json
    {
        "AWS_LAMBDA_EXEC_WRAPPER": "/opt/second-example-layer"
    }
    ```

## Debugging / Problem Solving

If you run into issues, the best place to start is to ensure that you have the Lambda environmental variables setup correctly.  Additionally, make sure that either the optionally supplied ``ASSUME_ROLE_ARN`` has the necessary access to read and decrypt the targeted Secret.  If not supplying the ``ASSUME_ROLE_ARN`` envrionmental variable, make sure that the role configured on the Lambda has the ability to read and decrypt the Secret.  If you are using the code as is, then the necessary role and permissions will be assigned and used.

If you run into issues from the build, ensure that your CLI is setup to allow access to create stacks, deploy changes (Lambda layers and functions, IAM roles and permissions).

## Local Testing

In cases where you want to test the layer to ensure that it functions correctly you can perform the following steps on a Linux instance that uses the Amazon Linux 2 AMI.
1. Download the source and follow the earlier steps to build the ``Golang`` code
1. Create the environmental variables using the ``export`` command, for example:
    ```sh
    export SECRET_NAME="dtSecret"
    ```
1. Make sure that the ``get-secrets-layer`` is exectuable (follow steps under the ``Usage`` section for details)
1. Run the shell script and verify that you get a positive result without error.  Since a layer passes off execution to some other executable, I recommend testing with a simple python script:
    ```sh
    ./get-secrets-layer python $(pwd)/python-test.py
    ```
1. A positive result from the test will be output that includes the environmental variables printed out to the console.  You will have to search the output for your specific variable and value, for example:
    ```sh
    ./get-secrets-layer python $(pwd)/python-test.py | grep TEST_DATA
    ```

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the [LICENSE](LICENSE) file.