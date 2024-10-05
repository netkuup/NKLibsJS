# NKSemaphore

**Example:**

    const semaphore = new NKSemaphore(1); // Allows only one thread to enter the semaphore zone at once
    
    await semaphore.acquire();
        //Semaphore zone
    semaphore.release();