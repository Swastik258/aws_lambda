document.addEventListener('DOMContentLoaded', function() {
    // 🔗 Your API Gateway endpoint
    const API_ENDPOINT = 'https://lrkgg62l93.execute-api.ap-south-1.amazonaws.com/Prod/calculator';

    // 🌐 Get references to form and elements
    const calculatorForm = document.getElementById('calculatorForm');
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const calculateBtn = document.getElementById('calculateBtn');
    const btnText = document.getElementById('btnText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    const resultSection = document.getElementById('resultSection');

    // Result elements
    const resultId = document.getElementById('resultId');
    const resultTimestamp = document.getElementById('resultTimestamp');
    const resultNum1 = document.getElementById('resultNum1');
    const resultNum2 = document.getElementById('resultNum2');
    const resultSum = document.getElementById('resultSum');

    // 🎯 Form submit event listener
    calculatorForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent page reload

        // Reset UI states
        errorAlert.classList.add('d-none');
        resultSection.classList.add('d-none');

        // 🧮 Get input values
        const num1 = parseFloat(num1Input.value);
        const num2 = parseFloat(num2Input.value);

        if (isNaN(num1) || isNaN(num2)) {
            showError('Please enter valid numbers');
            return;
        }

        // ⏳ Show loading spinner
        setLoadingState(true);

        const requestData = { num1: num1, num2: num2 };

        // 🚀 Send POST request to Lambda via API Gateway
        fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        })
        .then(async response => {
            let data;
            try {
                data = await response.json();
            } catch (err) {
                throw new Error('Invalid JSON response from API');
            }

            if (!response.ok) {
                const errMsg = data.message || 'Server error';
                throw new Error(errMsg);
            }

            return data;
        })
        .then(data => {
            setLoadingState(false);

            // 🧩 Handle both Lambda proxy and direct JSON
            let resultData;
            if (data.body) {
                try {
                    resultData = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
                } catch (err) {
                    showError('Error parsing API response: ' + err.message);
                    return;
                }
            } else {
                resultData = data;
            }

            if (resultData && resultData.result) {
                displayResult(resultData);
            } else {
                showError('Unexpected API response format');
            }
        })
        .catch(error => {
            setLoadingState(false);
            showError(error.message || 'An error occurred while communicating with the API');
        });
    });

    // ⚙️ Error display function
    function showError(message) {
        errorMessage.textContent = message;
        errorAlert.classList.remove('d-none');
    }

    // ⚙️ Loading state management
    function setLoadingState(isLoading) {
        if (isLoading) {
            btnText.textContent = 'Calculating...';
            loadingSpinner.classList.remove('d-none');
            calculateBtn.disabled = true;
        } else {
            btnText.textContent = 'CALCULATE';
            loadingSpinner.classList.add('d-none');
            calculateBtn.disabled = false;
        }
    }

    // 🧾 Display successful result
    function displayResult(data) {
        const result = data.result;
        if (!result) {
            showError('No result data in the API response');
            return;
        }

        let timestampDisplay = result.Timestamp;
        if (result.Timestamp && !isNaN(result.Timestamp)) {
            const date = new Date(parseInt(result.Timestamp) * 1000);
            timestampDisplay = date.toLocaleString();
        }

        resultId.textContent = result.ID || 'N/A';
        resultTimestamp.textContent = timestampDisplay || 'N/A';
        resultNum1.textContent = result.num1;
        resultNum2.textContent = result.num2;
        resultSum.textContent = result.sum;

        resultSection.classList.remove('d-none');
    }
});
