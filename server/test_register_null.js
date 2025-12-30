async function testRegister() {
    const userData = {
        name: "Test Null Loc",
        email: `debug_null_${Date.now()}@example.com`,
        password: "password123",
        role: "ngo",
        address: "123 Debug Lane",
        location: { latitude: null, longitude: null }
    };

    try {
        console.log("Sending registration request with null location...");
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            console.error("Registration Failed status:", res.status);
            console.error("Error Message:", data);
        } else {
            console.log("Success:", data);
        }
    } catch (error) {
        console.error("Request Failed:", error);
    }
}

testRegister();
