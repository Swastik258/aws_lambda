document.addEventListener('DOMContentLoaded', function() {
    // Define the API endpoint. REPLACE THIS WITH YOUR ACTUAL API GATEWAY INVOKE URL!
    const API_ENDPOINT = 'https://lrkgg62l93.execute-api.ap-south-1.amazonaws.com/Prod/calculator'; // Example: https://5nur6rhsjb.execute-api.us-east-1.amazonaws.com/dev

    // Get references to our HTML elements so we can interact with them.
    const calculatorForm = document.getElementById('calculatorForm');
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const calculateBtn = document.getElementById('calculateBtn');
    const btnText = document.getElementById('btnText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    const resultSection = document.getElementById('resultSection');

    // References to the elements where we'll display the results.
    const resultId = document.getElementById('resultId');
    const resultTimestamp = document.getElementById('resultTimestamp');
    const resultNum1 = document.getElementById('resultNum1');
    const resultNum2 = document.getElementById('resultNum2');
    const resultSum = document.getElementById('resultSum');

    // Listen for when the calculator form is submitted (i.e., when the "CALCULATE" button is clicked).
    calculatorForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission behavior (which would refresh the page).

        // Hide any previous error messages or results before a new calculation.
        errorAlert.classList.add('d-none'); // 'd-none' is a class (from our CSS) to hide elements.
        resultSection.classList.add('d-none');

        // Get the values entered by the user in the input fields and convert them to numbers.
        const num1 = parseFloat(num1Input.value);
        const num2 = parseFloat(num2Input.value);

        // Basic input validation: Check if the values are actually numbers.
        if (isNaN(num1) || isNaN(num2)) {
            showError('Please enter valid numbers'); // Display an error if inputs are not numbers.
            return; // Stop the function here.
        }

        // Show a loading state on the button to indicate that a calculation is in progress.
        setLoadingState(true);

        // Prepare the data to be sent to our API Gateway in JSON format.
        const requestData = {
            num1: num1,
            num2: num2
        };

        // Use the Fetch API to send a POST request to our API Gateway endpoint.
        fetch(API_ENDPOINT, {
            method: 'POST', // We are sending data, so it's a POST request.
            headers: {
                'Content-Type': 'application/json' // Tell the API we're sending JSON data.
            },
            body: JSON.stringify(requestData) // Convert our JavaScript object to a JSON string.
        })
        .then(response => {
            // Check if the network response was OK (status code 200-299).
            if (!response.ok) {
                // If not OK, try to parse the error message from the response body.
                return response.json().then(errData => {
                    throw new Error(errData.message || 'Server error');
                });
            }
            // If OK, parse the successful response body as JSON.
            return response.json();
        })
        .then(data => {
            // Once we get a response, hide the loading state.
            setLoadingState(false);

            // Process the response from our Lambda function.
            // Our Lambda function wraps the actual result in a 'body' string, so we need to parse it again.
            if (data.statusCode && data.statusCode === 200 && data.body) {
                try {
                    // Try to parse the nested 'body' string into a JavaScript object.
                    const resultData = typeof data.body === 'string' 
                        ? JSON.parse(data.body) 
                        : data.body;

                    // Display the calculation result on the page.
                    displayResult(resultData);
                } catch (err) {
                    showError('Error parsing the result: ' + err.message);
                }
            } else {
                showError('Unexpected API response format'); // If the response isn't what we expect.
            }
        })
        .catch(error => {
            // Catch any errors that occurred during the fetch operation (e.g., network issues, API errors).
            setLoadingState(false); // Hide loading state even on error.
            showError(error.message || 'An error occurred while communicating with the API');
        });
    });

    // Helper function to display an error message.
    function showError(message) {
        errorMessage.textContent = message; // Set the error message text.
        errorAlert.classList.remove('d-none'); // Show the error alert.
    }

    // Helper function to manage the button's loading state.
    function setLoadingState(isLoading) {
        if (isLoading) {
            btnText.textContent = 'Calculating...'; // Change button text.
            loadingSpinner.classList.remove('d-none'); // Show spinner.
            calculateBtn.disabled = true; // Disable button to prevent multiple clicks.
        } else {
            btnText.textContent = 'CALCULATE'; // Reset button text.
            loadingSpinner.classList.add('d-none'); // Hide spinner.
            calculateBtn.disabled = false; // Enable button.
        }
    }

    // Helper function to display the successful calculation result.
    function displayResult(data) {
        // Ensure we have the 'result' object from the API response.
        if (!data.result) {
            showError('No result data in the API response');
            return;
        }

        const result = data.result;

        // Format the timestamp into a human-readable date and time.
        let timestampDisplay = result.Timestamp;
        if (result.Timestamp && !isNaN(result.Timestamp)) {
            const date = new Date(parseInt(result.Timestamp) * 1000); // Convert milliseconds to Date object.
            timestampDisplay = date.toLocaleString(); // Format to local date/time string.
        }

        // Update the text content of our result display elements.
        resultId.textContent = result.ID || 'N/A';
        resultTimestamp.textContent = timestampDisplay || 'N/A';
        resultNum1.textContent = result.num1;
        resultNum2.textContent = result.num2;
        resultSum.textContent = result.sum;

        // Show the result section.
        resultSection.classList.remove('d-none');
    }
});
