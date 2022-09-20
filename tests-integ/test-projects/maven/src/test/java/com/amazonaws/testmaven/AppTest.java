package com.amazonaws.testmaven;

import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class AppTest
{
    @Test
    public void Test1()
    {
        assertTrue( 1 + 1 == 2 );
    }

    @Test
    public void Test2()
    {
        assertTrue( 2 + 2 == 4 );
    }

    @Test
    public void Test3()
    {
        assertTrue( 3 + 3 == 6 );
    }
}
