#
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
#
# This function is used to test the conversion of Secrets to Lambda Environmental Variables
#

import os
import json
import sys

def lambda_handler(event, context):
    print(f"Got event in main lambda [{event}]",flush=True)
    
    # Return all of the data
    return {
        'statusCode': 200,
        'layer': {
            'EXAMPLE_CONNECTION_TOKEN': os.environ.get('EXAMPLE_CONNECTION_TOKEN', 'Not Set'),
            'EXAMPLE_CLUSTER_ID': os.environ.get('EXAMPLE_CLUSTER_ID', 'Not Set'),
            'EXAMPLE_CONNECTION_URL': os.environ.get('EXAMPLE_CONNECTION_URL', 'Not Set'),
            'EXAMPLE_TENANT': os.environ.get('EXAMPLE_TENANT', 'Not Set'),
            'AWS_LAMBDA_EXEC_WRAPPER': os.environ.get('AWS_LAMBDA_EXEC_WRAPPER', 'Not Set')
        },
        'secondLayer': {
            'SECOND_LAYER_EXECUTE': os.environ.get('SECOND_LAYER_EXECUTE', 'Not Set')
        }
    }