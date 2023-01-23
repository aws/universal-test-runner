package com.amazonaws.testmaven2;

import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class AppTest2
{
    @Test
    public void test1()
    {
        assertTrue( 1 + 1 == 2 );
    }

    @Test
    public void test2()
    {
        assertTrue( 2 + 2 == 4 );
    }

    @Test
    public void test3()
    {
        assertTrue( 3 + 3 == 6 );
    }
}
